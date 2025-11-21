import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EnrichedItem } from '@script/enrich/type';

@Component({
  selector: 'app-inventory-tooltip',
  imports: [],
  templateUrl: './inventory-tooltip.html',
  styleUrl: './inventory-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryTooltip {
  item = input.required<EnrichedItem>();

  top = input.required<number>();
  left = input.required<number>();
}
