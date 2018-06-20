import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanDeactivateGuard } from './can-deactivate-guard.service';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SourcesAndTagsComponent } from './sources-and-tags/sources-and-tags.component';
import { VisualizationComponent } from './visualization/visualization.component';

const routes: Routes = [
  { path: 'sources-and-tags', component: SourcesAndTagsComponent },
  { path: 'visualization', component: VisualizationComponent },
  { path: '', redirectTo: 'sources-and-tags', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];


@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        useHash: true,
        // enableTracing: true // <-- debugging purposes only
      }
    )
  ],
  exports: [ RouterModule ],
  providers: [
    CanDeactivateGuard,
  ]
})
export class AppRoutingModule { }
