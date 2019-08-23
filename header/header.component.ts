import { Component } from '@angular/core';
import { AuthenticationService } from '../shared/services/authentication.service';
import { Response } from '@angular/http';
@Component({
	selector: 'header',
	templateUrl: './header.component.html',
	providers: [AuthenticationService]
})
export class HeaderComponent {
	UserName: string;
	Groups: string[];

	constructor(private authenticationService: AuthenticationService) { }
	ngOnInit() {
		this.authenticationService.getUser().map(username=>username).subscribe(
			username => {
				console.log("Get Username for logged in user");
				console.log(username);
				this.UserName = username["_body"];
			},
			error => {
				console.log(error)

			}
		)
	}
}