import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CoreModule, HOOK_COMPONENTS } from "@c8y/ngx-components";

import { ContextWidgetConfig } from "@c8y/ngx-components/context-dashboard";
import { AdvancedMapWidgetConfig } from "./advanced-map-widget-config.component";
import { AdvancedMapWidgetComponent } from "./advanced-map-widget.component";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { SubDeviceResolverComponent } from "./sub-devices-selector/sub-device-resolver.component";
import { AdvancedMapWidgetService } from "./advanced-map-widget.service";
import { ModalModule as BsModalModule } from "ngx-bootstrap/modal";
import { EventLineCreatorModalComponent } from "./event-line-creator/event-line-creator-modal.component";
import { TrackListComponent } from "./track-list/track-list.component";
import { DrawLineCreatorModalComponent } from "./draw-line-creator/draw-line-creator-modal.component";
import { AngularResizedEventModule } from "angular-resize-event";
import { HttpClientJsonpModule } from "@angular/common/http";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LeafletModule,
    BsModalModule.forRoot(),
    AngularResizedEventModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    HttpClientJsonpModule,
    CoreModule,
  ],
  declarations: [
    AdvancedMapWidgetConfig,
    AdvancedMapWidgetComponent,
    SubDeviceResolverComponent,
    EventLineCreatorModalComponent,
    DrawLineCreatorModalComponent,
    TrackListComponent,
  ],
  entryComponents: [
    AdvancedMapWidgetConfig,
    AdvancedMapWidgetComponent,
    EventLineCreatorModalComponent,
    DrawLineCreatorModalComponent,
    TrackListComponent,
  ],
  providers: [
    AdvancedMapWidgetService,
    {
      provide: HOOK_COMPONENTS,
      multi: true,
      useValue: {
        id: "iot.cumulocity.advanced.map.widget",
        label: "Advanced map widget",
        description: "Displays a map with position markers for selected devices. Support for configuration of additional layers and custom markers.",
        component: AdvancedMapWidgetComponent,
        configComponent: AdvancedMapWidgetConfig,
        // comment this if you want to test the widget
        previewImage: require("./previewImage.png"),
        data: {
          settings: {
            noNewWidgets: false, // Set this to true, to don't allow adding new widgets.
            ng1: {
              options: {
                noDeviceTarget: false, // Set this to true to hide the device selector.
                groupsSelectable: true, // Set this, if not only devices should be selectable.
              },
            },
          },
        } as ContextWidgetConfig,
      },
    },
  ],
})
export class AdvancedMapWidgetModule {}
