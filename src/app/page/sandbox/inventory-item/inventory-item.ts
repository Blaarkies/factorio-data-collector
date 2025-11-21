import {
  ChangeDetectionStrategy,
  Component,
  computed, ElementRef, inject,
  input,
  signal, viewChild
} from '@angular/core';
import { EnrichedItem } from '@app/page/sandbox/sandbox/type';
import { delayWhen, of, Subject, takeUntil, timer } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  InventoryTooltip
} from '@app/page/sandbox/inventory-tooltip/inventory-tooltip';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-inventory-item',
  imports: [
    InventoryTooltip,
    AsyncPipe
  ],
  templateUrl: './inventory-item.html',
  styleUrl: './inventory-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryItem {
  item = input.required<EnrichedItem>();
  count = input<number | undefined>();
  isInteractive = input(false);

  protected countFormatted = computed(() => {
    let count = this.count();
    if (count === undefined) {
      return;
    }

    if (count < 1) {
      return count.toFixed(2);
    }
    let floored = Math.floor(count);

    if (floored > (1e4 - 1)) {
      let digits = floored.toString().split('');
      let exp = digits.length - 1;
      let leading2Digits = Number(digits.slice(0, 2).join(''));
      let leadingDigitsAsDecimal = leading2Digits / 10;
      let round = Math.round(leadingDigitsAsDecimal);
      return `${round}e${exp}`;
    }

    return floored;
  });

  protected top = signal(0);
  protected left = signal(0);
  private self = inject(ElementRef);
  private hover$ = new Subject<boolean>();
  protected isHovering = toSignal(
    this.hover$.pipe(
      delayWhen(yes => yes
        ? timer(600).pipe(takeUntil(this.hover$))
        : timer(250).pipe(takeUntil(this.hover$)))));

  protected isHover(yes = true) {
    this.hover$.next(yes);

    if (yes) {
      let {bottom, right}
        = (this.self.nativeElement as HTMLElement)
        .firstElementChild.getBoundingClientRect();
      this.top.set(bottom);
      this.left.set(right);
    }
  }
}
