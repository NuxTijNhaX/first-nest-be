import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEventDto } from './create-event.dto';
import { UpdateEventDto } from './update-event.dto';
import { Event } from './event.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendee } from './attendee.entity';

@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
  ) {}

  @Get('/practice')
  // async practice() {
  //   const event = await this.eventRepository.findOne({
  //     where: {
  //       id: 1,
  //     },
  //     // relations: ['attendees'],
  //     // loadEagerRelations: false,
  //   });

  //   return event;
  // }
  async practice() {
    const event = await this.eventRepository.findOne({
      where: {
        id: 1,
      },
      relations: ['attendees'],
    });

    // const event = new Event();
    // event.id = 1;

    const attendee = new Attendee();
    attendee.name = 'DevNhaXX cascade';
    // attendee.event = event;

    event.attendees.push(attendee);

    // await this.attendeeRepository.save(attendee);

    await this.eventRepository.save(event);

    return event;
  }

  @Get(':id')
  async findOne(@Param('id') id) {
    this.logger.log('Event - findOne - Getted');
    const event = await this.eventRepository.findOne({
      where: {
        id,
      },
    });

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }

  @Get()
  async findAll() {
    const event = await this.eventRepository.find();

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }

  @Post()
  // @Body(ValidationPipe) for specification
  async create(@Body() input: CreateEventDto) {
    return await this.eventRepository.save({
      ...input,
      when: input.when ? new Date(input.when) : new Date(),
    });
  }

  @Patch(':id')
  async update(@Param('id') id, @Body() input: UpdateEventDto) {
    const event = await this.eventRepository.findOne(id);

    return await this.eventRepository.save({
      ...input,
      ...event,
      when: input.when ? new Date(input.when) : event.when,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id) {
    const event = await this.eventRepository.findOne(id);
    return await this.eventRepository.remove(event);
  }
}
