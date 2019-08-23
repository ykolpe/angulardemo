import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { sharedConfig } from './app.module.shared';

@NgModule({
    bootstrap: sharedConfig.bootstrap,
    declarations: sharedConfig.declarations,
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ...sharedConfig.imports
    ],
    providers: [
        //AccountsPayableService,
		{ provide: 'ORIGIN_URL', useValue: location.origin },
		{ provide: 'LOCALSTORAGE', useFactory: getLocalStorage }
    ]
})
export class AppModule {
}
export function getLocalStorage() {
	return (typeof window !== "undefined") ? window.localStorage : null;
}

