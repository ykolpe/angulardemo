import { NgModule, Component, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './components/app/app.component';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { Ng2PaginationModule } from 'ng2-pagination';

import { HeaderComponent } from './components/header/header.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { HomeComponent } from './components/home/home.component';
import { AccountsPayableComponent } from './components/accountspayable/accountspayable.component';
import { AccountsPayableService } from './components/accountspayable/accounts-payable.service';
import { ContractsComponent } from './components/contracts/contracts.component';
import { ContractsService } from './components/contracts/contracts.service';
import { ProjectControlsComponent } from './components/project-controls/project-controls.component';
import { ProjectControlsService } from './components/project-controls/project-controls.service';
import { RulesComponent } from './components/rules/rules.component';
import { RulesService } from './components/rules/rules.service';
import { RuleComponent, RuleDetailModalContent } from './components/rule/rule.component';
import { RuleService } from './components/rule/rule.service';
import { RuleChangeReviewComponent } from './components/rule-change-review/rule-change-review.component';
import { RuleChangeReviewService } from './components/rule-change-review/rule-change-review.service';
import { AlertComponent } from './components/alert/alert.component';
import { AlertService } from './components/shared/services/alert.service';
import { AuthenticationService } from './components/shared/services/authentication.service';

export const sharedConfig: NgModule = {
    bootstrap: [AppComponent],
    entryComponents: [RulesComponent,
        RuleComponent,
        RuleDetailModalContent],
    declarations: [
        AppComponent,
        HeaderComponent,
        NavigationComponent,
        HomeComponent,
        AccountsPayableComponent,
        ContractsComponent,
        ProjectControlsComponent,
        RulesComponent,
        RuleComponent,
        RuleDetailModalContent,
		RuleChangeReviewComponent,
		AlertComponent,
    ],
    imports: [
        FormsModule,
        Ng2PaginationModule,
        NgbModule.forRoot(),
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'accounts-payable', component: AccountsPayableComponent },
            { path: 'contracts-list', component: ContractsComponent },
            { path: 'project-controls', component: ProjectControlsComponent },
            { path: 'rules-search', component: RulesComponent },
            { path: 'rule/:id', component: RuleComponent },
            { path: 'rule-change-review', component: RuleChangeReviewComponent },
            { path: '**', redirectTo: 'home' }
        ])
    ],
    providers: [
        AccountsPayableService,
        ContractsService,
        ProjectControlsService,
        RuleChangeReviewService,
        RuleService,
		RulesService,
		AlertService,
		AuthenticationService,
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
};
