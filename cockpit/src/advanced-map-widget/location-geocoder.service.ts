import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IFetchOptions } from "@c8y/client";
import { FetchClient } from "@c8y/ngx-components/api";
import { LatLng } from "leaflet";
import { isEmpty } from "lodash-es";

@Injectable()
export class LocationGeocoderService {
  mapKey = "MgOKczqMYTkXK5jiMgEYGvjnTHf562mA";
  geoCodeSearchUrl = `//open.mapquestapi.com/nominatim/v1/search.php?key=${this.mapKey}`;

  constructor(private http: HttpClient) {}

  async geoCode(address: string): Promise<LatLng | null> {
    // const config = {
    //   jsonpCallbackParam: "json_callback",
    //   params: {
    //     format: "json",
    //     q: address,
    //   },
    // };

    const response = await this.http
      .jsonp(
        `${this.geoCodeSearchUrl}&q=${address}&format=json`,
        "json_callback"
      )
      .toPromise();
    const result = response as { lat: number; lon: number }[];

    // .fetch(
    //   `${this.geoCodeSearchUrl}&q=${address}&format=json`,
    //   options
    // );

    if (!isEmpty(result)) {
      const coordinates = result[0];
      return new LatLng(coordinates.lat, coordinates.lon);
    }
    return null;
  }
}
