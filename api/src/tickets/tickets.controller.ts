import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { TicketsService } from './tickets.service';
import { join } from 'path';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('generate/:reservationId')
  async generateTicket(@Param('reservationId') reservationId: string) {
    try {
      const result = await this.ticketsService.generateTicket(reservationId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Ticket generated successfully',
        data: {
          fileName: result.fileName,
          downloadUrl: `/uploads/tickets/${result.fileName}`,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get('download/:fileName')
  async downloadTicket(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    try {
      const filePath = await this.ticketsService.getTicketFilePath(fileName);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );

      return res.sendFile(filePath);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get('view/:fileName')
  async viewTicket(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      const filePath = await this.ticketsService.getTicketFilePath(fileName);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

      return res.sendFile(filePath);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
