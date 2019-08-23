import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StTable, StPageable, StOrder } from '../st-table/st-table.component';
import { RuleService, Rule, RuleDetail, RuleDTO, RuleHeaderAddData, RuleEdit, RuleDetailAddData, RuleDetailListResponse, RuleHeaderEditResponse, RuleDetailListData, RuleHeaderUpdateData, RuleDetailUpdateData } from './rule.service';
import { ICAPSafeStringCompare } from '../app.settings';

@Component({
    selector: 'rule-detail-modal-content',
    templateUrl: './rule-detail-modal-content.html'
})
export class RuleDetailModalContent {
  @Input() ruleDetail;

  constructor(public activeModal: NgbActiveModal) { }
}

@Component({
    selector: 'rules',
    templateUrl: './rule.component.html',
    styleUrls: ['./rule.component.css'],
    providers: [RuleService]
})

export class RuleComponent implements OnInit {
    static STORAGE = "rule.component.page";
    title1 = "Rule Editor";

    ruleDetailcolumns = [
        { field: 'MCU', label: 'Business Unit', function: (a1: RuleDetail, a2: RuleDetail) => ICAPSafeStringCompare(a1.MCU, a2.MCU ) },
        { field: 'OBJ', label: 'Object', function: (a1: RuleDetail, a2: RuleDetail) => ICAPSafeStringCompare(a1.OBJ, a2.OBJ) },
        { field: 'SUB', label: 'Phase/WF', function: (a1: RuleDetail, a2: RuleDetail) => ICAPSafeStringCompare(a1.SUB, a2.SUB) },
        { field: 'AssetID', label: 'Asset ID', function: (a1: RuleDetail, a2: RuleDetail) => ICAPSafeStringCompare(a1.AssetID, a2.AssetID) },
        { field: 'SubLedger', label: 'Grant ID', function: (a1: RuleDetail, a2: RuleDetail) => ICAPSafeStringCompare(a1.SubLedger, a2.SubLedger) },
        { field: 'Percentage', label: 'Percentage', function: (a1: RuleDetail, a2: RuleDetail) => ICAPSafeStringCompare(a1.Percentage, a2.Percentage) },
    ];

    p: number = 1;
    totalPages: number = 0;
    totalItems: number = 0;

    sortOrder: StOrder = new StOrder("RuleName", 'asc');

    localStorageName: string;
    showError: boolean = false;
    selectedRule: Rule;
    addRule: Rule;
    ruleDetail: RuleDetail;
    editRule: RuleEdit;
    editDetailData: RuleDetailListData;
    ruleDtoResponse: RuleDTO;
    editMode: boolean;
    addRuleDetail: RuleDetailAddData;
    deleteResponse: any;
    loading: boolean = true;
    loadingRuleandDetails: boolean = true;
    loadingRuleDetails: boolean = true;
    DetailsTitle: string;
    ruleDetailSearchResponse: RuleDetailListResponse;
    ruleHeaderEditResponse: RuleHeaderEditResponse;
    ruleHeaderUpdateData: RuleHeaderUpdateData;
    ruleDetailUpdate: RuleDetailUpdateData;

    mcu: string = "";
    assetID: string = "";
    sub: string = "";
    obj: string = "";
    percentage: number = 0;
    subLedger: string = "";
    ruleDetailID: number = 0;
    ruleHeaderID: number = 0;
    timestampString: string = "";


  constructor(private route: ActivatedRoute,
   private router: Router,
   private modalService: NgbModal,
   private rulesService: RuleService,
   private modal: NgbModal)
  {
      console.log("Where in the constructor of the rule component class.");
  }

  // ngOnint entry method
  ngOnInit() {
     
      let paging = localStorage.getItem(RuleComponent.STORAGE);
      if (paging) {
          this.sortOrder = JSON.parse(paging);
      }

      console.log("We are at the beginning of the ngOnInit method.");

      // create a rule and rule detail list object
      this.editRule = new RuleEdit;

      var id = +this.route.snapshot.params["id"];
      //var timeStamp = +this.route.snapshot.params["timestamp"];

      if (id) {
          this.editMode = true;

          // fetch the Rule header and detail from the server
          this.loadingRuleandDetails = true;

          console.log("The selected ID is: " + id);

          this.rulesService.get(id, this.p).subscribe(
              rlh => {
                  console.log("Receieved the rule header and detail records");
                  console.log(rlh);

                  console.log("Setting the Rule DTO from the service.");

                  console.log(rlh);

                  this.ruleHeaderEditResponse = rlh;

                  console.log("Setting the Rule Header from the service.");

                  console.log(this.ruleHeaderEditResponse);

                  this.editRule = this.ruleHeaderEditResponse.RuleDto.RuleHeader;

                  console.log(this.editRule);

                  console.log(" Rule Header ID: " + this.editRule.RuleHeaderID);

                  console.log("Setting the Rule Detail from the service.");

                  this.editRule.details = this.ruleHeaderEditResponse.RuleDto.RuleDetails;

                  console.log("Rule detail data in response object.");

                  console.log(this.editRule.details);

                  this.p = this.ruleHeaderEditResponse.CurrentPage;
                  this.totalPages = this.ruleHeaderEditResponse.TotalPages;
                  this.totalItems = this.ruleHeaderEditResponse.TotalItems;

                  this.loadingRuleandDetails = false;

                  console.log("Existing the OnInit method.");
              },
              error => {
                  console.log(error)
                  this.loadingRuleandDetails = false;
              }
          )
      }

  }


  public getServerData(pagein: number) {

      this.p = pagein;

      this.refreshTable();

      this.p = this.ruleDetailSearchResponse.CurrentPage;

      return event;
  }

  // refresh and get a list of rule header detail
  refreshTable = () => {
      console.log("We are calling rules service to get a list of rule detail for the given rule header ID.");

      this.loadingRuleDetails = true;
      this.rulesService.getDetails(this.editRule.RuleHeaderID, this.p).subscribe(
          cts => {
              console.log("Receieved a list of details.");

              console.log(cts);
              this.ruleDetailSearchResponse = cts;

              console.log("Clear the Details list");

              this.editRule.details = null;

              console.log(this.editRule.details);

              console.log("New list from service.");

              console.log(this.ruleDetailSearchResponse.RuleDetailList)

              console.log("Set the detail list with values from service.");

              this.editRule.details = this.ruleDetailSearchResponse.RuleDetailList;

              console.log(this.editRule.details);

              this.p = this.ruleDetailSearchResponse.CurrentPage;
              this.totalPages = this.ruleDetailSearchResponse.TotalPages;
              this.totalItems = this.ruleDetailSearchResponse.TotalItems;

              console.log("Exiting the refresh a list of details.");

              this.loadingRuleDetails = false;
          },
          error => {
              console.log(error)
              this.loadingRuleDetails = false;
          }
      )
  }

  // create a new ruyle detail
  newDetail = (addruledetailcontent: any) => {
      this.DetailsTitle = "New Rule Detail";

      console.log("Setting up the display data for new Rule.");

      this.editDetailData = new RuleDetailListData();
      this.editDetailData.AssetID = "";
      this.editDetailData.MCU = "";
      this.editDetailData.OBJ = "";
      this.editDetailData.Percentage = 0;
      this.editDetailData.SUB = "";
      this.editDetailData.SubLedger = "";
      this.editDetailData.RuleHeaderID = this.editRule.RuleHeaderID;


      console.log("Opening the model display for new Rule Header");

      this.modal.open(addruledetailcontent)
          .result.then((result) => {

              console.log("We are in the result area of the new rule detail method.");


              console.log(this.editDetailData);

              let addDetailData = new RuleDetailAddData;

              addDetailData.AssetId = this.editDetailData.AssetID;
              addDetailData.MCU = this.editDetailData.MCU;
              addDetailData.SUB = this.editDetailData.SUB;
              addDetailData.OBJ = this.editDetailData.OBJ;
              addDetailData.Percentage = this.editDetailData.Percentage;
              addDetailData.SBL = this.editDetailData.SubLedger;

              console.log(addDetailData);

              console.log("We are calling the service for inserting data into the rules table.");

              this.rulesService
                  .insertRuleDetail(addDetailData, this.editDetailData.RuleHeaderID)
                  .subscribe(res => {

                      this.refreshTable();
                  },
                  error => {
                      this.showError = true;
                      console.log(error);
                      alert(error);
                  });

          }, (reason) => {
              console.log(`Dismissed ${reason}`);
          });
  }

  // edit rule detail
  editDetail = (addruledetailcontent: any, detail: RuleDetail) => {

    try {
        this.DetailsTitle = "Edit Rule Detail";

        console.log("Setting up the display data to edit the Rule Detail.");

        this.editDetailData = null;

        this.editDetailData = new RuleDetailListData();

        this.editDetailData.AssetID = (detail.AssetID != null) ? detail.AssetID : "";
        this.editDetailData.MCU = (detail.MCU != null) ? detail.MCU : "";
        this.editDetailData.SUB = (detail.SUB != null) ? detail.SUB : "";
        this.editDetailData.OBJ = (detail.OBJ != null) ? detail.OBJ : "";
        this.editDetailData.Percentage = detail.Percentage;
        this.editDetailData.SubLedger = (detail.SubLedger != null) ? detail.SubLedger : "";
        this.editDetailData.RuleDetailID = detail.RuleDetailID;
        this.editDetailData.RuleHeaderID = detail.RuleHeaderID;
        this.editDetailData.TimestampString = detail.TimestampString;

        console.log("This is the rule detail data.");

        console.log("Opening the model display for new Rule Edit Detail");

        console.log("This is the value of the Rule Detail for editing.");

        if (this.editDetailData != null)
        {
            console.log(this.editDetailData.MCU.toString());
        }

        this.modal.open(addruledetailcontent)
            .result.then((result) => {

                console.log("We are in the result area of the new rule detail method.");


                console.log(this.editDetailData);

                let updDetailData = new RuleDetailUpdateData();

				updDetailData.AssetID = this.editDetailData.AssetID;
                updDetailData.MCU = this.editDetailData.MCU;
                updDetailData.SUB = this.editDetailData.SUB;
                updDetailData.OBJ = this.editDetailData.OBJ;
                updDetailData.Percentage = this.editDetailData.Percentage;
                updDetailData.SBL = this.editDetailData.SubLedger;
                updDetailData.RuleDetailID = this.editDetailData.RuleDetailID;
                updDetailData.RuleHeaderID = this.editDetailData.RuleHeaderID;
                updDetailData.TimestampString = this.editDetailData.TimestampString;

                console.log(updDetailData);

                console.log("We are calling the service for inserting data into the rules table.");

                this.rulesService
                    .updateRuleDetail(updDetailData)
                    .subscribe(res => {

                        this.refreshTable();
                    },
                    error => {
                        this.showError = true;
                        console.log(error);
                        alert(error);
                    });

            }, (reason) => {
                console.log(`Dismissed ${reason}`);
            });

    } catch (e) {
        alert(e.message);
    }
  }

  saveDetail = () => {

	}


  // save rule header
  save = () => {

      if (this.editDetail != null)
      {
          console.log("We are ready to save updates to the Rule Header");

          this.ruleHeaderUpdateData = new RuleHeaderUpdateData();
          this.ruleHeaderUpdateData.CreatedBy = this.editRule.CreatedBy;
          this.ruleHeaderUpdateData.CreatedDate = this.editRule.CreatedDate;
          this.ruleHeaderUpdateData.Justification = this.editRule.Justification;
          this.ruleHeaderUpdateData.RuleDescription = this.editRule.RuleDescription;
          this.ruleHeaderUpdateData.RuleHeaderID = this.editRule.RuleHeaderID;
          this.ruleHeaderUpdateData.RuleName = this.editRule.RuleName;
          this.ruleHeaderUpdateData.Status = this.editRule.Status;
          this.ruleHeaderUpdateData.TimestampString = this.editRule.TimestampString;

          this.rulesService.updateRule(this.ruleHeaderUpdateData).subscribe(
            rlh => {
                console.log("Receieved the rule header and detail records");
                console.log(rlh);

                console.log("Setting the Rule DTO from the service.");

                console.log(rlh);

                this.editRule = rlh;

                this.router.navigate(["rules-search"]);

            },
            error => {
                this.showError = true;
                console.log(error);
                alert(error);
            }
        )
      }
	}

	approve = () => {
		console.log("We are in the approve rule process.");

		console.log("Rule Header status to change, ID: " + this.editRule.RuleHeaderID + " New Status: " + this.rulesService.GetActionDisplayValue(this.editRule.Status));

		this.rulesService
			.actionRuleHeader(this.editRule)
			.subscribe(
			resp => {
				console.log("We are in the response logic area for validate.");
				console.log(resp);
                alert(resp.Message);
                this.ngOnInit();
			},
			error => {
				this.showError = true;
				console.log(error);
				alert(error);
			});
	}

  deleteDetail = (deletedDetail: RuleDetail) => {
      console.log("We are calling accounts payable service to delete a rule.")

      console.log("Rule Header to Delete, ID: " + deletedDetail.RuleHeaderID.toString() + " Timestamp: " + deletedDetail.TimestampString);
      try {
          let resp = confirm(`Are you sure you would wnat to delete the Rule Detail: ${deletedDetail.MCU}?`);
          if (resp) {
              this.rulesService
                  .deleteRuleDetail(deletedDetail.RuleDetailID, deletedDetail.RuleHeaderID, deletedDetail.TimestampString)
                  .subscribe(
                  resp => {
                      console.log("We are in the response logic area for delete.");
                      console.log(resp);

                      this.refreshTable();

                      alert("Rule Detail successfully delete.");
                  },
                  error => {
                      this.showError = true;
                      console.log(error);
                      alert(error);
                  });
          }
      } catch (e) {
          alert(e.message);
      }
  }

  cancel = () => {
      this.router.navigate(['/rules-search']);
  }

  changeSort = (prop: string) => {
      this.loading = true;
      this.sortOrder.property = prop;
      this.sortOrder.direction = this.sortOrder.direction == 'asc' ? 'desc' : 'asc';
      localStorage.setItem(this.localStorageName, JSON.stringify(this.sortOrder));
      this.editRule.details = this.editRule.details.sort(this.ruleDetailcolumns.find(c => c.field == this.sortOrder.property).function);
      if (this.sortOrder.direction == 'desc') {
          this.editRule.details = this.editRule.details.reverse();
      }
      this.loading = false;
  }
}
