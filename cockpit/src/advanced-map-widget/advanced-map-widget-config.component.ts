import { DynamicComponent, OnBeforeSave } from "@c8y/ngx-components";
import { IManagedObject } from "@c8y/client";
import { Component, Input, OnInit } from "@angular/core";
import { LatLng } from "leaflet";
import { BsModalService } from "ngx-bootstrap/modal";
import { take } from "rxjs/operators";
import { clone, isEmpty } from "lodash-es";
import { EventLineCreatorModalComponent } from "./event-line-creator/event-line-creator-modal.component";
import { DrawLineCreatorModalComponent } from "./draw-line-creator/draw-line-creator-modal.component";

export interface IAdvancedMapWidgetConfig {
  device?: IManagedObject;
  cars?: IManagedObject[];
  selectedTrack?: string;
  tracks?: ITrack[];
  saved?: boolean;
}

export interface ITrack {
  name: string;
  coords: LatLng[];
  createDate: Date;
}

export type WidgetConfigMode = "CREATE" | "UPDATE";

@Component({
  templateUrl: "./advanced-map-widget-config.component.html",
})
export class AdvancedMapWidgetConfig
  implements OnInit, DynamicComponent, OnBeforeSave
{
  @Input() config: IAdvancedMapWidgetConfig = {};
  ng1FormRef?: any;
  items: IManagedObject[] = [];
  mode: WidgetConfigMode;

  constructor(private bsModalService: BsModalService) {}

  ngOnInit(): void {
    this.mode = this.config.saved ? "UPDATE" : "CREATE";
  }

  onSubDevicesChanged(devices: IManagedObject[]): void {
    this.config.cars = devices;
  }

  async openEventTrackCreatorModal() {
    const modalRef = this.bsModalService.show(EventLineCreatorModalComponent);
    modalRef.content.items = clone(this.config.cars);
    const openExportTemplateModal = modalRef.content.closeSubject
      .pipe(take(1))
      .toPromise();
    const track = await openExportTemplateModal;
    this.addTrackToConfig(track);
  }

  async openDrawTrackCreatorModal() {
    const modalRef = this.bsModalService.show(DrawLineCreatorModalComponent, {
      class: "modal-lg",
    });
    const openExportTemplateModal = modalRef.content.closeSubject
      .pipe(take(1))
      .toPromise();
    const track = await openExportTemplateModal;
    this.addTrackToConfig(track);
  }

  private addTrackToConfig(track: ITrack | null): void {
    if (!track) {
      return;
    }
    if (!this.config.tracks) {
      this.config.tracks = [];
    }
    this.config.tracks.push(track);
  }

  deleteTrack(track: ITrack): void {
    this.config.tracks = this.config.tracks.filter(
      (t) => t.name !== track.name
    );
    if (this.config.selectedTrack === track.name) {
      this.config.selectedTrack = null;
    }
  }

  userChangedSelection(event: { checked: boolean; track: ITrack }): void {
    const { checked, track } = event;
    if (checked) {
      // check and select a new element (automatically unchecks other ones)
      this.config.selectedTrack = track.name;
    } else if (track.name === this.config.selectedTrack) {
      this.config.selectedTrack = null;
    }
  }

  async onBeforeSave(config?: IAdvancedMapWidgetConfig): Promise<boolean> {
    if (isEmpty(this.config.cars)) {
      return false;
    }

    config.saved = true;
    return true;
  }
}
