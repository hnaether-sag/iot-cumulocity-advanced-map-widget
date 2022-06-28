import { Injectable } from "@angular/core";
import { IEvent, IManagedObject, Realtime } from "@c8y/client";
import { RealtimeService } from "@c8y/ngx-components";
import { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { ILocationUpdateEvent } from "./advanced-map-widget.service";
import { has } from 'lodash-es';

@Injectable()
export class LocationRealtimeService extends RealtimeService<IEvent> {
  constructor(realtime: Realtime) {
    super(realtime);
  }

  protected channel(): string {
    return "/events/*";
  }

  private isLocationUpdateEvent(event: IEvent): event is ILocationUpdateEvent {
    return event.type === "c8y_LocationUpdate" && has(event, "c8y_Position");
  }

  startListening(
    devices: IManagedObject[]
  ): Observable<ILocationUpdateEvent>[] {
    const events$ = devices
      .map((d) => d.id)
      .map((id) =>
        this.onAll$(id).pipe(
          filter((message) => message.realtimeAction === "CREATE"),
          map((message) => message.data as IEvent),
          filter((event) => this.isLocationUpdateEvent(event)),
          map((event) => event as ILocationUpdateEvent)
        )
      );
    return events$;
  }
}
