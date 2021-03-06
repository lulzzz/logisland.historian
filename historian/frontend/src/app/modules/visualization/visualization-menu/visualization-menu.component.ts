import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { AutoRefreshInterval } from '../../../shared/refresh-rate-selection/auto-refresh-interval';
import { TimeRangeFilter } from '../../../shared/time-range-selection/time-range-filter';
import { TagsSelection } from '../../selection/Selection';
import { ProfilService } from '../../../profil/profil.service';
import { SelectionDashboardComponent } from '../../selection/selection-dashboard/selection-dashboard.component';

@Component({
  selector: 'app-visualization-menu',
  templateUrl: './visualization-menu.component.html',
  styleUrls: ['./visualization-menu.component.css']
})
export class VisualizationMenuComponent implements OnInit {

  menuItemActive: string = '';

  @Input() tagSelector?: boolean = true;
  @Input() autoRefreshIntervalSelector?: boolean = true;
  @Input() timeRangeSelector?: boolean = true;

  @Input() autoRefreshInterval: AutoRefreshInterval;
  @Output() autoRefreshIntervalChange = new EventEmitter<AutoRefreshInterval>();

  @Input() timeRange: TimeRangeFilter;
  @Output() timeRangeChange = new EventEmitter<TimeRangeFilter>();

  @Input() tagSelection: TagsSelection;
  @Output() tagSelectionChange = new EventEmitter<TagsSelection>();

  @Output() tagSelectionUpdated = new EventEmitter<TagsSelection>();

  @Input() view: string;
  @Output() viewChange = new EventEmitter<string>();

  @ViewChild(SelectionDashboardComponent)
  private selectionDashboardComp: SelectionDashboardComponent;

  onAutoRefreshIntervalChanged(newVal: AutoRefreshInterval) {
    this.autoRefreshIntervalChange.emit(newVal);
    this.menuItemActive = '';
  }

  onTimeRangeChanged(newVal: TimeRangeFilter) {
    this.timeRangeChange.emit(newVal);
    this.menuItemActive = '';
  }

  ontagSelectionChanged(newVal: TagsSelection) {
    this.tagSelectionChange.emit(newVal);
  }

  onTagSelectionUpdated(updatedVal: TagsSelection) {
    this.tagSelectionUpdated.emit(updatedVal);
  }

  onViewChanged(newVal: string) {
    this.viewChange.emit(newVal);
  }

  constructor(public profilService: ProfilService) {}

  ngOnInit() {}

  toggleItemMenu(item: string): void {
    if (this.menuItemActive === item) {
      this.menuItemActive = '';
    } else {
      this.menuItemActive = item;
    }
  }

  // work around bug p-dropdown
  setDashboardDropDownValue(selection: TagsSelection) {
    this.selectionDashboardComp.dropDown.updateSelectedOption(selection);
  }
}
