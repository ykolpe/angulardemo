import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/services/authentication.service';

@Component({
    selector: 'navigation',
	templateUrl: './navigation.component.html',
	providers: [AuthenticationService]
})
export class NavigationComponent implements OnInit {
	public UserName: string;
	public Groups: string[];

	constructor(private authenticationService: AuthenticationService) { }
	ngOnInit() {
				this.authenticationService.getGroups().map(groups => groups).subscribe(
			groups => {
				console.log("Get groups for logged in user");
				console.log(groups["_body"]);
				this.Groups = groups["_body"];
				//alert(this.Groups);
			},
			error => {
				console.log(error)
			}
		)
	}
}   