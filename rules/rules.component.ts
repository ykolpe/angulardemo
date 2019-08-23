import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StTable, StPageable, StOrder } from '../st-table/st-table.component';
import { RulesService, Rule, RuleDetail, RuleSearch, RuleEditor, RuleHeaderAddData, ActionRuleResponse, RuleHeaderListResponse } from './rules.service';
import { ICAPSafeStringCompare } from '../app.settings';
import { AuthenticationService } from '../shared/services/authentication.service';

const STORAGE = "icap.rules-admin.page";
const FILTER_STORAGE = "icap.rules-admin.filter";

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css'],
	providers: [RulesService, AuthenticationService]
})

export class RulesComponent implements OnInit {

    p: number = 1;
    totalPages: number = 0;
    totalItems: number = 0;

    title = "Rules Administration";
    loading: boolean = false;
    loadingRules: boolean = false;
    loadingCreators: boolean = false;
    ruleValidating: boolean = false;

    localStorageName: string;
    showError: boolean = false;
    ruleSearch: RuleSearch;
    selectedUser: string = "";
    creators: RuleEditor[] = [];
    ruleHeaders: Rule[] = [];
    selectedRule: Rule;
    addRule: Rule;
    addRuleHeader: RuleHeaderAddData;
    ruleSearchResponse: RuleHeaderListResponse;

	deleteResponse: any;
	public Groups: string[];

    table = new StTable<Rule>();
  showFilter: boolean = true;
  filter = {
    ruleName: "",
    createdBy: "",
    status: []
  }

   columns = [
      { field: 'RuleName', label: 'RuleName'},
      { field: 'CreatedDate', label: 'CreatedDate'},
      { field: 'Status', label: 'Status' },
      { field: 'CreatedBy', label: 'CreatedBy' },
  ];

  pageable: StPageable = new StPageable();

  sortOrder: StOrder = new StOrder("RuleName", 'asc');

  constructor(private route: ActivatedRoute,
      private router: Router,
      private modalService: NgbModal,
      private rulesService: RulesService,
	  private modal: NgbModal,
	  private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
      console.log("We are in the OnInit method.")

      console.log("We are calling rules service to get a list of creators.")

      this.clearFilter();

      this.toggleStatus('unapproved');
      this.toggleStatus('approved');
      this.toggleStatus('archived');


      this.ruleSearch = new RuleSearch();
      this.ruleSearch.Approved = true;
      this.ruleSearch.UnApproved = true;
      this.ruleSearch.Archived = true;
      this.ruleSearch.CreatedBy = "";
      this.ruleSearch.RuleName = "";

      this.loadingCreators = true;

	  console.log("What's in the status array: " + this.filter.status.values);

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
      this.rulesService.getCreators().subscribe
          (
          cts => {
              console.log("Receieved a list of creators");
              console.log(cts);
              this.creators = cts;
              this.loadingCreators = false;
          },
          error => {
              console.log(error)
              this.loadingCreators = false;
          }
      )

      let paging = localStorage.getItem(STORAGE);

        if (paging) {
          this.pageable = JSON.parse(paging);
        } else {
          this.pageable.sort.orders.push(new StOrder("RuleName", 'asc'));
        }
        let filters = localStorage.getItem(FILTER_STORAGE);
        if (filters) {
          if (filters.length > 0) {
            this.filter = JSON.parse(filters);
          }
        }

    //console.log("We are loading the initial list of created by users.")
    //this.refreshTable();
  }

  changeSort = (prop: string) => {
    this.pageable.sort.orders[0].property = prop;
    this.pageable.sort.orders[0].direction = this.pageable.sort.orders[0].direction == 'asc' ? 'desc' : 'asc';
    this.refreshTable();
  }

  refreshTable = () => {

      console.log("We are in the refresh method of rules component.")

      localStorage.setItem(STORAGE, JSON.stringify(this.pageable));
      localStorage.setItem(FILTER_STORAGE, JSON.stringify(this.filter));

      console.log("Setting the rule serch values in refresh.")

      console.log("These are the filter values : " + this.filter.status.entries + ": " + this.filter.ruleName + ": " + this.ruleSearch.CreatedBy);

      this.ruleSearch.RuleName = this.filter.ruleName;

      let uindex = this.filter.status.indexOf('unapproved');
      this.ruleSearch.UnApproved = (uindex > -1) ? true : false;

      let aindex = this.filter.status.indexOf('approved');
      this.ruleSearch.Approved = (aindex > -1) ? true : false;

      let rindex = this.filter.status.indexOf('archived');
      this.ruleSearch.Archived = (rindex > -1) ? true : false;

      console.log("We are loading the initial list of rules by users.")

      this.searchRules();
  }

  public getServerData(pagein: number) {

      this.p = pagein;

      this.searchRules();

      this.p = this.ruleSearchResponse.CurrentPage;

      return event;
  }

  searchRules = () => {
      this.loadingRules = true;
      this.ruleHeaders = [];

      console.log("This is the selected user: " + this.selectedUser);

      this.ruleSearch.RuleName = this.filter.ruleName;
      this.ruleSearch.CreatedBy = this.selectedUser;

      console.log("We are calling the service for rule headers.");

      console.log("These are the filter values : " + this.filter.status.entries + ": " + this.filter.ruleName + ": " + this.ruleSearch.CreatedBy);

      this.rulesService.searchRules(this.ruleSearch, this.p).subscribe(
          rls => {

              console.log("These are the rule header records in the return object.");
              console.log(rls);
              //this.ruleHeaders = rls.sort(this.columns.find(c => c.field == this.sortOrder.property).function);
              this.ruleSearchResponse = rls;
              this.ruleHeaders = this.ruleSearchResponse.RuleHeaderList;
              this.p = this.ruleSearchResponse.CurrentPage;
              this.totalPages = this.ruleSearchResponse.TotalPages;
              this.totalItems = this.ruleSearchResponse.TotalItems;
              
              console.log("This is what's in the rule header variable object.");
              console.log(this.ruleHeaders);
              this.loadingRules = false;
          },
          error => {
              console.log(error);
              this.loadingRules = false;
          }
      )
  }

  action = (erule: Rule) => {
      console.log("We are in the action rule process.");

      console.log("Rule Header status to change, ID: " + erule.RuleHeaderID + " New Status: " + this.rulesService.GetActionDisplayValue(erule.Status));

      this.rulesService
          .actionRuleHeader(erule)
          .subscribe(
          resp => {
              console.log("We are in the response logic area for validate.");
              console.log(resp);

              if (this.ruleSearch.CreatedBy != null || this.ruleSearch.RuleName != null) {
                  this.searchRules();
              }

              // I'm leaving this if here. I want to implement the bootstrap alert panel later
              // and based on the type of result I get back, I'll toggle the response 
              //if (resp.Result )
              //{
              //    alert(resp.Message);
              //}

              alert(resp.Message);
          },
          error => {
              this.showError = true;
              console.log(error);
              alert(error);
          });
  }

  changeUser = (creator: string) => {
      this.selectedUser = creator;
  }

  newRule = (addrulecontent: any) => {
      console.log("Setting up the display data for new Rule.");

      this.addRule = new Rule;
      this.addRule.RuleName = "";
      this.addRule.RuleDescription = "";
      this.addRule.Justification = "";

      console.log("Opening the model display for new Rule Header");

      this.modal.open(addrulecontent)
          .result.then((result) => {

              console.log("We are in the result area of the new rule method.");

              let addRuleData = new RuleHeaderAddData;

              addRuleData.RuleName = this.addRule.RuleName;
              addRuleData.Description = this.addRule.RuleDescription;
              addRuleData.Justification = this.addRule.Justification;
              addRuleData.Status = "Approved";

              console.log("We are calling the service for inserting data into the rules table.");

              this.rulesService
                  .insertRuleHeader(addRuleData)
                  .subscribe(res => {

                      console.log("Null check for rule search criteria. Crfeated By: " + this.ruleSearch.CreatedBy + " Rule Name: " + this.ruleSearch.RuleName);

                      if (typeof this.ruleSearch.CreatedBy != 'undefined' || typeof this.ruleSearch.RuleName != 'undefined') {
                          this.searchRules();
                      }
                  });

          }, (reason) => {
              console.log(`Dismissed ${reason}`);
          });
  }

  edit = (erule) => {
      console.log("We are in the Edit Rule method.");

      this.selectedRule = erule;
      console.log("Rule with Id "
          + this.selectedRule.RuleHeaderID
          + " has been selected.");

      this.router.navigate(['/rule', this.selectedRule.RuleHeaderID]);
  }

  delete = (deletedRule) => {
      console.log("We are calling accounts payable service to delete a rule.")

      console.log("Rule Header to Delete, ID: " + deletedRule.RuleHeaderID + " Timestamp: " + deletedRule.TimestampString);

      let resp = confirm(`Are you sure you would wnat to delete the Rule : ${deletedRule.RuleName}?`);
      if (resp) {
          this.rulesService
              .deleteRuleHeader(deletedRule.RuleHeaderID, deletedRule.TimestampString)
              .subscribe(
              resp => {
                  console.log("We are in the response logic area for delete.");
                  console.log(resp);

                  if (this.ruleSearch.CreatedBy != null || this.ruleSearch.RuleName != null) {
                      this.searchRules();
                  }
                  alert("Rule successfully delete.");
              },
              error => {
                  this.showError = true;
                  console.log(error);
                  alert(error);
              });
      }
  }

  archive = (erule) => {
      console.log("We are in the action rule process.");

      console.log("Rule Header status to change, ID: " + erule.RuleHeaderID + " New Status: " + this.rulesService.GetActionDisplayValue(erule.Status));

      this.rulesService
          .actionRuleHeader(erule)
          .subscribe(
          resp => {
              console.log("We are in the response logic area for validate.");
              console.log(resp);

              if (this.ruleSearch.CreatedBy != null || this.ruleSearch.RuleName != null) {
                  this.searchRules();
              }

              // I'm leaving this if here. I want to implement the bootstrap alert panel later
              // and based on the type of result I get back, I'll toggle the response 
              //if (resp.Result )
              //{
              //    alert(resp.Message);
              //}

              alert(resp.Message);
          },
          error => {
              this.showError = true;
              console.log(error);
              alert(error);
          });
  }

  validate = (erule) => {

      console.log("We are in the validate rule process.");

      console.log("Rule Header to Validate, ID: " + erule.RuleHeaderID + " New Status: " + "");

      this.rulesService
          .validateRuleHeader(erule.RuleHeaderID, erule.Status)
          .subscribe(
          resp => {
              console.log("We are in the response logic area for validate.");
              console.log(resp);

              if (this.ruleSearch.CreatedBy != null || this.ruleSearch.RuleName != null) {
                  this.searchRules();
              }

              // I'm leaving this if here. I want to implement the bootstrap alert panel later
              // and based on the type of result I get back, I'll toggle the response 
              //if (resp.Result )
              //{
              //    alert(resp.Message);
              //}

              alert(resp.Message);
          },
          error => {
              this.showError = true;
              console.log(error);
              alert(error);
          });
  }

  applyFilter = () => {
    this.pageable.offset = 0;
    this.pageable.pageNumber = 0;
    this.refreshTable();
  }

  clearFilter = () => {
    this.pageable.offset = 0;
    this.pageable.pageNumber = 0;
    this.filter.createdBy = "";
    this.filter.ruleName = null;
    this.filter.status = [];
    //this.refreshTable();
  }

  toggleStatus = (status) => {
    let index = this.filter.status.indexOf(status);
    if (index > -1) {
      this.filter.status.splice(index, 1);
    } else {
      this.filter.status.push(status);
    }
  }

  changePageNumber = (newPage: number) => {
    if (this.pageable.offset != newPage) {
      this.pageable.offset = newPage;
      this.pageable.pageNumber = newPage;
      this.refreshTable();
    }
  }

  changePageSize = (newSize: number) => {
    if (this.pageable.pageSize != newSize) {
      this.pageable.pageSize = newSize;
      this.refreshTable();
    }
  }
}
