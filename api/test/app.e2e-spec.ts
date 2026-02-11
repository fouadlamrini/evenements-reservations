import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { User } from '../src/users/schemas/user.schema';
import { Event, EventStatus } from '../src/events/schemas/event.schema';
import { Reservation, ReservationStatus } from '../src/reservation/schemas/reservation.schema';
import { Role } from '../src/roles/role.enum';
import * as bcrypt from 'bcrypt';

describe('Event Reservation System (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let eventModel: Model<Event>;
  let reservationModel: Model<Reservation>;

  let adminToken: string;
  let participantToken: string;
  let adminId: string;
  let participantId: string;
  let eventId: string;
  let reservationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get<Model<User>>('UserModel');
    eventModel = moduleFixture.get<Model<Event>>('EventModel');
    reservationModel = moduleFixture.get<Model<Reservation>>('ReservationModel');
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
    await eventModel.deleteMany({});
    await reservationModel.deleteMany({});

    // Create admin user
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = await userModel.create({
      email: 'admin@test.com',
      password: hashedAdminPassword,
      role: Role.Admin,
      name: 'Admin User',
    });
    adminId = admin._id.toString();

    // Create participant user
    const hashedParticipantPassword = await bcrypt.hash('participant123', 10);
    const participant = await userModel.create({
      email: 'participant@test.com',
      password: hashedParticipantPassword,
      role: Role.Participant,
      name: 'Participant User',
    });
    participantId = participant._id.toString();

    // Login as admin
    const adminLoginResponse = await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    adminToken = adminLoginResponse.body.access_token;

    // Login as participant
    const participantLoginResponse = await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'participant@test.com', password: 'participant123' });
    participantToken = participantLoginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('should register a new participant', () => {
      return supertest(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newparticipant@test.com',
          password: 'new123',
          role: Role.Participant,
          name: 'New Participant',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.email).toBe('newparticipant@test.com');
          expect(res.body.user.role).toBe(Role.Participant);
        });
    });

    it('should login admin successfully', () => {
      return supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'admin123' })
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.role).toBe(Role.Admin);
        });
    });

    it('should fail login with wrong credentials', () => {
      return supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('Event Management Flow', () => {
    it('should create an event as admin', () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-25',
        time: '14:00',
        location: 'Test Location',
        maxCapacity: 10,
      };

      return supertest(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe(eventData.title);
          expect(res.body.status).toBe(EventStatus.DRAFT);
          expect(res.body.creatorId).toBe(adminId);
          eventId = res.body._id;
        });
    });

    it('should fail to create event without authentication', () => {
      const eventData = {
        title: 'Unauthorized Event',
        description: 'Should fail',
        date: '2024-12-25',
        time: '14:00',
        location: 'Test Location',
        maxCapacity: 10,
      };

      return supertest(app.getHttpServer())
        .post('/events')
        .send(eventData)
        .expect(401);
    });

    it('should publish an event as admin', () => {
      return supertest(app.getHttpServer())
        .patch(`/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(EventStatus.PUBLISHED);
        });
    });

    it('should get list of published events (public)', () => {
      return supertest(app.getHttpServer())
        .get('/events')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].status).toBe(EventStatus.PUBLISHED);
        });
    });

    it('should get admin events list', () => {
      return supertest(app.getHttpServer())
        .get('/events/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].creatorId).toBe(adminId);
        });
    });
  });

  describe('Reservation Management Flow', () => {
    it('should create a reservation as participant', () => {
      return supertest(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId })
        .expect(201)
        .expect((res) => {
          expect(res.body.eventId).toBe(eventId);
          expect(res.body.participantId).toBe(participantId);
          expect(res.body.status).toBe(ReservationStatus.PENDING);
          reservationId = res.body._id;
        });
    });

    it('should fail to reserve same event twice', () => {
      return supertest(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId })
        .expect(400);
    });

    it('should get participant reservations', () => {
      return supertest(app.getHttpServer())
        .get('/reservation/participant')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].participantId).toBe(participantId);
        });
    });

    it('should get all reservations as admin', () => {
      return supertest(app.getHttpServer())
        .get('/reservation')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
        });
    });

    it('should confirm reservation as admin', () => {
      return supertest(app.getHttpServer())
        .patch(`/reservation/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: ReservationStatus.CONFIRMED })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(ReservationStatus.CONFIRMED);
        });
    });

    it('should cancel reservation as participant', () => {
      return supertest(app.getHttpServer())
        .patch(`/reservation/${reservationId}/cancel`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(ReservationStatus.CANCELED);
          expect(res.body.canceledBy).toBe('PARTICIPANT');
        });
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent participant from accessing admin routes', () => {
      return supertest(app.getHttpServer())
        .get('/events/admin')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(403);
    });

    it('should prevent participant from creating events', () => {
      const eventData = {
        title: 'Participant Event',
        description: 'Should fail',
        date: '2024-12-25',
        time: '14:00',
        location: 'Test Location',
        maxCapacity: 10,
      };

      return supertest(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${participantToken}`)
        .send(eventData)
        .expect(403);
    });

    it('should prevent participant from confirming reservations', () => {
      return supertest(app.getHttpServer())
        .patch(`/reservation/${reservationId}`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ status: ReservationStatus.CONFIRMED })
        .expect(403);
    });
  });

  describe('Business Rules Validation', () => {
    it('should prevent reservation on draft event', async () => {
      // Create a draft event
      const draftEvent = await eventModel.create({
        title: 'Draft Event',
        description: 'Not published',
        date: new Date('2024-12-25'),
        time: '14:00',
        location: 'Test Location',
        maxCapacity: 10,
        status: EventStatus.DRAFT,
        creatorId: adminId,
      });

      return supertest(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId: draftEvent._id })
        .expect(400);
    });

    it('should prevent reservation on full event', async () => {
      // Create a small capacity event
      const smallEvent = await eventModel.create({
        title: 'Small Event',
        description: 'Only 1 spot',
        date: new Date('2024-12-25'),
        time: '14:00',
        location: 'Test Location',
        maxCapacity: 1,
        status: EventStatus.PUBLISHED,
        creatorId: adminId,
      });

      // Create a reservation for another participant
      const otherParticipant = await userModel.create({
        email: 'other@test.com',
        password: await bcrypt.hash('other123', 10),
        role: Role.Participant,
        name: 'Other Participant',
      });

      const otherReservation = await reservationModel.create({
        eventId: smallEvent._id,
        participantId: otherParticipant._id,
        status: ReservationStatus.CONFIRMED,
      });

      return supertest(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId: smallEvent._id })
        .expect(400);
    });
  });
});
