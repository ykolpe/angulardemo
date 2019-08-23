import { Component, OnInit } from '@angular/core';
import { StOrder } from '../st-table/st-table.component';
import { ProjectControlsService, ContractByProject, Transaction, PrintResponse, PrintedTransaction, TransactionErrorsResponse, ProjectTransactionListResponse, Contract,ProjectResponse} from '../project-controls/project-controls.service';
import { ICAPSafeStringCompare } from '../app.settings';
import { AlertService } from '../shared/services/alert.service';
import { Alert, AlertType } from '../shared/services/alert';

@Component({
    templateUrl: './project-controls.component.html',
    styleUrls: ['./project-controls.component.css'],
	providers: [ProjectControlsService, AlertService]
})
export class ProjectControlsComponent implements OnInit {

  static STORAGE = "projectcontrols.component.page";

  title = "ICAP Transaction Validation";

  projects: ProjectResponse[] = [];
  selectedProject: string = "";
  contracts: ContractByProject[] = [];
  selectedContract: string = "";
  transactions: Transaction[] = [];
  selectedErrors: string[] = [];
  selectedRow: Number;
  transaction: Transaction;
  printedTransaction: PrintedTransaction;
  errorTransaction: PrintedTransaction;
  contractRecord: Contract = new Contract;
  projectTransactionListResponse: ProjectTransactionListResponse;
  alerts: Alert[] = [];
  loadingProjects: boolean = true;
  loadingContracts: boolean = false;
  loadingTransactions: boolean = false;

  columns = [
      { field: 'transactionType', label: 'Type', function: (a1: Transaction, a2: Transaction) => ICAPSafeStringCompare(a1.transactionType, a2.transactionType) },
      { field: 'transactionNumber', label: 'Number', function: (a1: Transaction, a2: Transaction) => ICAPSafeStringCompare(a1.transactionNumber, a2.transactionNumber) },
      { field: 'contractTitle', label: 'Description', function: (a1: Transaction, a2: Transaction) => ICAPSafeStringCompare(a1.contractTitle, a2.contractTitle) },
      { field: 'status', label: 'Status', function: (a1: Transaction, a2: Transaction) => ICAPSafeStringCompare(a1.status, a2.status) },
      { field: 'CreateDate', label: 'Date Printed', function: (a1: Transaction, a2: Transaction) => ICAPSafeStringCompare(a1.createDate, a2.createDate) },
      { field: 'contractAmount', label: 'Contract Amount', function: (a1: Transaction, a2: Transaction) => a1.contractAmount - a2.contractAmount, styleClass: 'text-right' },
      { field: 'contingencyAmount', label: 'Contingency Amount', function: (a1: Transaction, a2: Transaction) => a1.contingencyAmount - a2.contingencyAmount, styleClass: 'text-right' },
      { field: 'totalAmount', label: 'Total Amount', function: (a1: Transaction, a2: Transaction) => a1.totalAmount - a2.totalAmount, styleClass: 'text-right' },
  ];
  sortOrder: StOrder = new StOrder("transactionNumber", 'asc');

	constructor(private projectControlsService: ProjectControlsService, private alertService: AlertService) { }
  
  ngOnInit() {
    console.log("We are loading the initial list of projects.")

    let paging = localStorage.getItem(ProjectControlsComponent.STORAGE);
    if (paging) {
      this.sortOrder = JSON.parse(paging);
    }
	  this.refreshTable();
	  this.alertService.getAlert().subscribe((alert: Alert) => {
		  if (!alert) {
			  // clear alerts when an empty alert is received
			  this.alerts = [];
			  return;
		  }

		  // add alert to array
		  this.alerts.push(alert);
		  // remove alert after 5 seconds
		  //setTimeout(() => this.removeAlert(alert), 5000);
	  });
	}

	removeAlert(alert: Alert) {
		this.alerts = this.alerts.filter(x => x !== alert);
	}

	cssClass(alert: Alert) {
		if (!alert) {
			return;
		}

		 //return css class based on alert type
		switch (alert.type) {
			case AlertType.Success:
				return 'alert alert-success';
			case AlertType.Error:
				return 'alert alert-danger';
			case AlertType.Info:
				return 'alert alert-info';
			case AlertType.Warning:
				return 'alert alert-warning';
		}
	}

  refreshTable = () => {
    console.log("We are calling project controls service to get a list of projects.")

    this.loadingProjects = true;
    this.projectControlsService.projects().subscribe(
        pps => {
        console.log("Receieved a list of projects");
        console.log(pps);
        this.projects = pps;
        this.loadingProjects = false;
      },
      error => {
        console.log(error)
        this.loadingProjects = false;
      }
    )
  }

  changeProject = (project) => {
    this.loadingContracts = true;
    this.selectedContract = "";
    this.transactions = [];
	this.selectedProject = project;
	  console.log(this.selectedProject);
	let found = this.projects.find(p => p.ProjectNumber == project);
	  console.log(found.ContractShellNumber);
	  console.log("We are calling project controls service to get a list of contracts.")

	  this.projectControlsService.contractsForProject(found.ProjectNumber).subscribe(
      ccs => {
          console.log("We got our contracts list back.");
          console.log(ccs);
          this.contracts = ccs;
        this.loadingContracts = false;
      },
      error => {
        console.log(error);
        this.loadingContracts = false;
      }
    )
  }

  changeContract = (contract: string) => {
	this.loadingTransactions = true;
	this.projectTransactionListResponse = null;
    this.selectedContract = contract;
    this.transactions = [];
    let found = this.contracts.find(c => c.ContractNumber == contract);

    console.log("We are calling the service for contract transactions.");

    this.projectControlsService.transactionsForContract(found).subscribe(
        trxes => {

        this.projectTransactionListResponse = trxes;
        console.log("These are the transaction records in the return object.");
        console.log(trxes.TransactionWrappedList);

        console.log("This is the contract from the service. ");
        console.log(trxes.Contract);

        this.transactions = this.projectTransactionListResponse.TransactionWrappedList;
        console.log("This is the list of transactions from the service. ");
        console.log(trxes.TransactionWrappedList);

        this.contractRecord = this.projectTransactionListResponse.Contract;
            
        this.transactions = this.transactions.sort(this.columns.find(c => c.field == this.sortOrder.property).function);
        console.log("This is what's in the transactions variable object.");
        console.log(this.transactions);
        this.loadingTransactions = false;

      },
      error => {
        console.log(error);
        this.loadingTransactions = false;
      }
    )
  }

  closeErrors = () => {
    this.selectedErrors = [];
    console.log("closeErrors");
  }

  print = (Index: number, transaction: Transaction) => {
      console.log("UI list index is: " + Index);
      console.log(" True collection index is: " + transaction.TrueIndex.toString());
      console.log("We are calling project controls service to print expidition contracts to icap database.")
      let found = this.contracts.find(c => c.ContractNumber == this.selectedContract);
      console.log("Contract data is: " + found);


      this.projectControlsService
          .print(transaction.TrueIndex, found, transaction)
          .subscribe(
          resp => {
              console.log(resp);
              this.refreshTable();
              let sendResponse = <PrintResponse>resp;
              if(sendResponse.Success)
              {
                  this.transactions = sendResponse.ContractTransactions;

                  let testData = JSON.stringify(sendResponse);

                  console.log(testData);

                  //console.log("This is the Printed Transaction data: " + printedTransaction.transactionType);

                  console.log("Print Transaction ID: " + sendResponse.TransactionID.toString());

                  this.projectControlsService
                      .viewReport(sendResponse.TransactionID, sendResponse.TransactionType);
                  console.log("Completed the report call process.");

                  this.loadingTransactions = true;
                  this.transactions = this.transactions.sort(this.columns.find(c => c.field == this.sortOrder.property).function);
                  this.loadingTransactions = false;

                  console.log("Completed the trasnaction list update process.");

                  console.log("Send Error Code: " + sendResponse.Errors.toString() + "Error Message: " + sendResponse.Errors);

                  if (sendResponse.Errors != null && sendResponse.Errors != "Success") {

                      console.log("We are in the display warining ara. Message is: " + sendResponse.Errors);
					  //alert(sendResponse.Errors);
					  this.alertService.warn(sendResponse.Errors); 
				   }
                  //alert("Print process was successful!");
              }
              else {
                  console.log("displaying error message");
                  alert(sendResponse.Errors);
              }             
          },
          error => {
              console.log(error);
              alert(error[error.text]);
          });
  }

  errors = (contract: ContractByProject, transaction: Transaction) => {

      this.selectedErrors = [];
      let found = this.contracts.find(c => c.ContractNumber == this.selectedContract);

      console.log("We are calling the service for transaction errors.");

      this.projectControlsService.errors(transaction.TrueIndex, found).subscribe(
          terrs => {

              console.log("These are the error for the transaction in the return object.");
              console.log(terrs);
              this.selectedErrors = terrs.Errors;
              this.errorTransaction = terrs.ErrorTransaction;

              console.log("This is whats in the transactions variable object.");
              console.log(this.transactions);
              this.loadingTransactions = false;
          },
          error => {
              console.log(error);
              this.loadingTransactions = false;
          }
      )

  }

  revalidate = (contract: ContractByProject, transaction: Transaction) => {
      this.loadingTransactions = true;
      this.transactions = [];
      let found = this.contracts.find(c => c.ContractNumber == this.selectedContract);

      console.log("We are calling the service for revalidate transactions.");

      this.projectControlsService.revalidate(transaction.TrueIndex, found).subscribe(
          trxes => {

              console.log("These are the transaction records in the return object.");
              console.log(trxes);
              this.transactions = trxes.sort(this.columns.find(c => c.field == this.sortOrder.property).function);
              console.log("This is whats in the transactions variable object.");
              console.log(this.transactions);
              this.loadingTransactions = false;
          },
          error => {
              console.log(error);
              this.loadingTransactions = false;
          }
      )
  }

  changeSort = (prop: string) => {
    this.sortOrder.property = prop;
    this.sortOrder.direction = this.sortOrder.direction == 'asc' ? 'desc' : 'asc';
    localStorage.setItem(ProjectControlsComponent.STORAGE, JSON.stringify(this.sortOrder));
    this.transactions = this.transactions.sort(this.columns.find(c => c.field == this.sortOrder.property).function);
    if (this.sortOrder.direction == 'desc') {
      this.transactions = this.transactions.reverse();
    }
  }
}

