import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation } from '../reservation/schemas/reservation.schema';
import { Event } from '../events/schemas/event.schema';
import { User } from '../users/schemas/user.schema';
import PDFDocument = require('pdfkit');
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async generateTicket(reservationId: string): Promise<{ filePath: string; fileName: string }> {
    const reservation = await this.reservationModel
      .findById(reservationId)
      .populate('eventId')
      .populate('participantId')
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== 'CONFIRMED') {
      throw new BadRequestException('Reservation must be confirmed to generate ticket');
    }

    const event = reservation.eventId as any;
    const participant = reservation.participantId as any;

    const fileName = `ticket_${reservationId}_${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', 'tickets', fileName);

    await this.createPDF(filePath, {
      participantName: participant.name,
      eventTitle: event.title,
      eventDescription: event.description,
      eventLocation: event.location,
      eventDate: new Date(event.date).toLocaleDateString(),
      eventTime: event.time,
      reservationId: reservation._id.toString(),
    });

    return { filePath, fileName };
  }

  private async createPDF(filePath: string, data: {
    participantName: string;
    eventTitle: string;
    eventDescription: string;
    eventLocation: string;
    eventDate: string;
    eventTime: string;
    reservationId: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Add background image
      const imagePath = path.join(process.cwd(), '..', 'web', 'public', 'assets', 'ticket.jpeg');
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, 0, 0, {
          fit: [595.28, 841.89], // A4 size in points
          align: 'center',
          valign: 'center'
        });
      }

      // Position content strategically on the background
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 50;

      // Title at the top
      doc.fontSize(32).font('Helvetica-Bold').fillColor('white');
      doc.text('EVENT TICKET', margin, 80, { 
        width: pageWidth - 2 * margin, 
        align: 'center' 
      });

      // Reservation ID
      doc.fontSize(12).font('Helvetica').fillColor('white');
      doc.text(`Reservation ID: ${data.reservationId}`, margin, 130, { 
        width: pageWidth - 2 * margin, 
        align: 'center' 
      });

      // Participant Information Section
      doc.fontSize(18).font('Helvetica-Bold').fillColor('white');
      doc.text('PARTICIPANT', margin, 200);
      doc.fontSize(14).font('Helvetica').fillColor('white');
      doc.text(`Name: ${data.participantName}`, margin, 230);

      // Event Information Section
      doc.fontSize(18).font('Helvetica-Bold').fillColor('white');
      doc.text('EVENT DETAILS', margin, 300);
      
      doc.fontSize(14).font('Helvetica').fillColor('white');
      doc.text(`Title: ${data.eventTitle}`, margin, 330);
      
      // Description with word wrap
      doc.fontSize(12).font('Helvetica').fillColor('white');
      doc.text(`Description: ${data.eventDescription}`, margin, 360, {
        width: pageWidth - 2 * margin,
        align: 'left'
      });

      // Location, Date, Time
      doc.fontSize(14).font('Helvetica').fillColor('white');
      doc.text(`Location: ${data.eventLocation}`, margin, 420);
      doc.text(`Date: ${data.eventDate}`, margin, 450);
      doc.text(`Time: ${data.eventTime}`, margin, 480);

      // Confirmation message at bottom
      doc.fontSize(10).font('Helvetica-Oblique').fillColor('white');
      doc.text('This ticket confirms your reservation for the event.', margin, pageHeight - 100, {
        width: pageWidth - 2 * margin,
        align: 'center'
      });

      // Add a decorative line
      doc.strokeColor('white').lineWidth(1);
      doc.moveTo(margin, 250).lineTo(pageWidth - margin, 250).stroke();
      doc.moveTo(margin, 280).lineTo(pageWidth - margin, 280).stroke();

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', (error) => reject(error));
    });
  }

  async getTicketFilePath(fileName: string): Promise<string> {
    const filePath = path.join(process.cwd(), 'uploads', 'tickets', fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Ticket file not found');
    }

    return filePath;
  }
}
