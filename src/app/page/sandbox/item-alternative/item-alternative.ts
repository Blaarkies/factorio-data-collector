import {
  ChangeDetectionStrategy,
  Component, computed,
  inject,
  input
} from '@angular/core';
import {
  EnrichedAlternative,
  EnrichedItem
} from '@app/page/sandbox/sandbox/type';
import { InventoryItem } from '@app/page/sandbox/inventory-item/inventory-item';
import { DataAssetService } from '@app/page/sandbox/data-asset.service';

@Component({
  selector: 'app-item-alternative',
  imports: [
    InventoryItem
  ],
  templateUrl: './item-alternative.html',
  styleUrl: './item-alternative.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemAlternative {
  private enrichedItemsWithMap
    = inject(DataAssetService).enrichedItemsWithMap;

  mainItem = input.required<EnrichedItem>();
  alternative = input.required<EnrichedAlternative>();

  protected ingredientItemsWithCount = computed(() => {
    let alt = this.alternative();
    let nameItemMap = this.enrichedItemsWithMap().nameItemMap;

    return alt.ingredients.map(i => {
      let item = nameItemMap.get(i.name);
      let count = i.weightRatio * item.rocketCapacity;
      return {count, item};
    });
  });


}
