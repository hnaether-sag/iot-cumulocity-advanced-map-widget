import { AfterViewInit, Component, Input, OnDestroy } from "@angular/core";
import {
  divIcon,
  icon,
  latLng,
  Map as LMap,
  MapOptions,
  Marker,
  polyline,
  Polyline,
  tileLayer,
} from "leaflet";
import { IAdvancedMapWidgetConfig } from "./advanced-map-widget-config.component";
import { AdvancedMapWidgetService } from "./advanced-map-widget.service";
import { isEmpty } from "lodash-es";
import { Subscription } from "rxjs";
import { IEvent } from "@c8y/client";
import * as MarkerImage from "./marker-icon";

import { LocationRealtimeService } from "./location-reatime.service";

@Component({
  selector: "advanced-map-widget",
  providers: [LocationRealtimeService],
  styleUrls: ["./advanced-map-widget.component.less"],
  templateUrl: "./advanced-map-widget.component.html",
})
export class AdvancedMapWidgetComponent implements AfterViewInit, OnDestroy {
  map: LMap;
  markers = new Map<string, Marker<any>>();
  icon = icon({
    iconUrl: MarkerImage.markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
  });

  cfg: IAdvancedMapWidgetConfig;

  @Input() set config(cfg: IAdvancedMapWidgetConfig) {
    if (cfg) {
      this.cfg = cfg;
      if (this.map) {
        this.draw(cfg);
      }
    }
  }

  @Input() options: MapOptions = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        opacity: 0.7,
        maxZoom: 19,
        detectRetina: true,
        // attribution:
        //   '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }),
    ],
    zoom: 1,
    center: latLng(0, 0),
    attributionControl: false,
  };

  private locationSubs: Subscription[];
  circuit: Polyline;

  constructor(
    private trackService: AdvancedMapWidgetService,
    private eventsRealtime: LocationRealtimeService
  ) {}

  ngAfterViewInit(): void {
    this.map.invalidateSize();
  }

  onMapReady(map: LMap): void {
    this.map = map;
    if (this.cfg) {
      this.draw(this.cfg);
    }
  }

  onResized(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  private draw(config: IAdvancedMapWidgetConfig) {
    const track = this.trackService.getTrack(config);
    if (track && this.map) {
      const line = polyline(track.coords);
      line.addTo(this.map);
      this.map.fitBounds(line.getBounds());
    }

    if (!isEmpty(config.cars)) {
      if (!isEmpty(this.locationSubs)) {
        this.tearDownRealtime();
      }
      const carLocations$ = this.eventsRealtime.startListening(config.cars);
      this.locationSubs = carLocations$.map((location$) =>
        location$.subscribe((event) => this.onLocationUpdate(event))
      );
    }
  }

  private onLocationUpdate(event: IEvent): void {
    const coordinate = latLng(event.c8y_Position);
    if (this.markers.has(event.source.id)) {
      const marker = this.markers.get(event.source.id);
      marker.removeFrom(this.map);
    }
    // const marker = new Marker(coordinate, { icon: this.icon });
    const marker = new Marker(coordinate, {
      icon: this.createIcon(event.source.name),
    });
    // marker.bindPopup(`<b>${event.source.name}</b>`);
    marker.addTo(this.map);
    // marker.openPopup();
    this.markers.set(event.source.id, marker);
  }

  private createIcon(text: string) {
    return divIcon({
      html: `
      <svg width="80" height="60" xmlns="http://www.w3.org/2000/svg">
 <g>
  <title>Layer 1</title>
  <line stroke="#dee955" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_15" y2="15.64101" x2="28.16809" y1="59.65086" x1="-0.54422" fill="none"/>
  <line stroke-width="2" stroke="#dee955" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_23" y2="15.64101" x2="28.16809" y1="59.65086" x1="-0.54422" fill="none"/>
  <rect stroke="#dee955" id="svg_25" height="30.34014" width="61.90477" y="-0.20408" x="18.36734" stroke-width="0" fill="#dee955" fill-opacity="0.8"/>
  <path id="svg-text" d="M 22 20 H 75" fill="transparent" stroke="lightgray" />
  <text fill-opacity="0.8"><textPath
  xlink:href="#svg-text"
  method="stretch"
  lengthAdjust="spacingAndGlyphs"
>${text}</textPath></text>
 </g>
</svg>
      `,
      iconSize: [80, 60],
      iconAnchor: [0, 60],
      className: "era-div-icon",
    });
  }

  ngOnDestroy(): void {
    this.tearDownRealtime();
    this.map.clearAllEventListeners;
    this.map.remove();
  }

  private tearDownRealtime(): void {
    if (!isEmpty(this.locationSubs)) {
      this.locationSubs.forEach((sub) => sub.unsubscribe());
    }
  }
}
