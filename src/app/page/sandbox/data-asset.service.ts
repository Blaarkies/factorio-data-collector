import { inject, Injectable } from '@angular/core';
import { EnrichedItem } from '@script/enrich/type';
import { map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class DataAssetService {

  private http = inject(HttpClient);

  private enrichedItemsWithMap$ = this.http.get<EnrichedItem[]>(
    'factorio-data/enriched-items.json').pipe(
    map(items => {
      items.forEach(i => i.icon = `${i.name}.webp`)
      let nameItemMap = new Map(items.map(it => [it.name, it]));
      return {items, nameItemMap};
    }),
    startWith({
      items: [] as EnrichedItem[],
      nameItemMap: new Map<string, EnrichedItem>()
    }),
  );

  enrichedItemsWithMap = toSignal(this.enrichedItemsWithMap$);

}
