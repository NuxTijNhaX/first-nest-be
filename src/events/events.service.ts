import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { Event } from './event.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendeeAnswerEnum } from './attendee.entity';
import { ListEvents, WhenEventFilter } from './input/list.events';
import { PaginateOptions, paginate } from 'src/pagination/paginator';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  private getEventsBaseQuery(): SelectQueryBuilder<Event> {
    return this.eventRepository
      .createQueryBuilder('event')
      .orderBy('event.id', 'DESC');
  }

  public getEventsWithAttendeeCountQuery() {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('event.attendeeCount', 'event.attendees')
      .loadRelationCountAndMap(
        'event.attendeeAccepted',
        'event.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          }),
      )
      .loadRelationCountAndMap(
        'event.attendeeMaybe',
        'event.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          }),
      )
      .loadRelationCountAndMap(
        'event.attendeeRejected',
        'event.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          }),
      );
  }

  private getEventsWithAttendeeCountQueryFiltered(filter?: ListEvents) {
    let query = this.getEventsBaseQuery();

    if (!filter) {
      return query;
    }

    if (filter.when) {
      switch (Number(filter.when)) {
        case WhenEventFilter.Today:
          query = query.andWhere(
            'event.when >= CURDATE() AND event.when <=CURDATE() + INTERVAL 1 DAY',
          );
          break;
        case WhenEventFilter.Tomorrow:
          query = query.andWhere(
            'event.when >= CURDATE() + INTERVAL 1 DAY AND event.when <=CURDATE() + INTERVAL 2 DAY',
          );
          break;
        case WhenEventFilter.ThisWeek:
          query = query.andWhere(
            'YEARWEEK(event.when, 1) = YEARWEEK(CURDATE(), 1)',
          );
          break;
        case WhenEventFilter.NextWeek:
          query = query.andWhere(
            'YEARWEEK(event.when, 1) = YEARWEEK(CURDATE(), 1) + 1',
          );
          break;
        default:
          break;
      }
    }

    return query;
  }

  public async getEventsWithAttendeeCountQueryFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions,
  ) {
    return await paginate(
      await this.getEventsWithAttendeeCountQueryFiltered(filter),
      paginateOptions,
    );
  }

  public async getEvent(id: number): Promise<Event> | undefined {
    const query = this.getEventsWithAttendeeCountQuery().andWhere(
      'event.id = :id',
      { id },
    );

    this.logger.debug(query.getSql());

    return await query.getOne();
  }

  public async removeEvent(id: number): Promise<DeleteResult> | undefined {
    return await this.eventRepository
      .createQueryBuilder('event')
      .delete()
      .where('event.id = :id', { id })
      .execute();
  }
}
