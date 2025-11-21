import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { map, merge, Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  EnrichedItem,
  EnrichedItemWithEnrichedAlternatives,
} from '@app/page/sandbox/sandbox/type';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { getEnrichedAlternative } from '@app/page/sandbox/process-ingredient';
import {
  ItemAlternative
} from '@app/page/sandbox/item-alternative/item-alternative';
import { DataAssetService } from '@app/page/sandbox/data-asset.service';
import { InventoryItem } from '@app/page/sandbox/inventory-item/inventory-item';


@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.html',
  styleUrl: './sandbox.scss',
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    ItemAlternative,
    InventoryItem,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class SandboxPage {

  private enrichedItemsWithMap = inject(DataAssetService).enrichedItemsWithMap;

  protected items = computed(() => this.enrichedItemsWithMap().items);

  protected controlItemSelector = new FormControl<string>(undefined);
  protected itemClick$ = new Subject<EnrichedItem>();

  private selectedItem = toSignal(merge(
    this.controlItemSelector.valueChanges.pipe(
      map(name => this.enrichedItemsWithMap().nameItemMap.get(name))),
    this.itemClick$));

  protected info = computed(() => {
    let item = this.selectedItem();
    let nameItemMap = this.enrichedItemsWithMap().nameItemMap;

    if (!item) {
      return;
    }

    let enrichedAlternatives = item.alternatives
      .map(recipe => getEnrichedAlternative(recipe, nameItemMap));

    return {...item, enrichedAlternatives} as
      EnrichedItemWithEnrichedAlternatives;
  });

}
