import { Component, OnInit, Inject } from '@angular/core';
import { StOrder } from '../st-table/st-table.component';
import { Contract, ContractsService, SendToEOneResponseMessageDTO, ContractTransactionsResponse } from './contracts.service';
import { ICAPSafeStringCompare } from '../app.settings';

@Component({
  selector: 'contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css'],
  providers: [ContractsService]
})

export class ContractsComponent implements OnInit {
    static STORAGE = "contracts.component.page";

    p: number = 1;
    totalPages: number = 0;
    totalItems: number = 0;

    contractTransactionsResponse: ContractTransactionsResponse;

    title = "Contract Transaction Review and Processing";
    transactions: Contract[] = [];
    columns = [
        { field: 'poNumber', label: 'PO Number', function: (a1: Contract, a2: Contract) => ICAPSafeStringCompare(a1.PoNumber, a2.PoNumber) },
        { field: 'reqNumber', label: 'Req Number', function: (a1: Contract, a2: Contract) => ICAPSafeStringCompare(a1.ReqNumber, a2.ReqNumber) },
        { field: 'contractNumber', label: 'Contract Number', function: (a1: Contract, a2: Contract) => ICAPSafeStringCompare(a1.ContractNumber, a2.ContractNumber) },
        { field: 'transactionType', label: 'Transaction Type', function: (a1: Contract, a2: Contract) => ICAPSafeStringCompare(a1.TransactionType, a2.TransactionType) },
        { field: 'transactionNumber', label: 'Transaction Number', function: (a1: Contract, a2: Contract) => ICAPSafeStringCompare(a1.TransactionNumber, a2.TransactionNumber) },
        { field: 'description', label: 'Description', function: (a1: Contract, a2: Contract) => ICAPSafeStringCompare(a1.Description, a2.Description) },
        { field: 'integrationStatus', label: 'Status', function: (a1: Contract, a2: Contract) => ICAPSafeStringCompare(a1.Status, a2.Status) },
        { field: 'totalAmount', label: 'Total Amount', function: (a1: Contract, a2: Contract) => a1.TotalAmount - a2.TotalAmount, styleClass: 'text-right' },
        { field: 'contingencyAmount', label: 'Contingency Amount', function: (a1: Contract, a2: Contract) => a1.ContingencyAmount - a2.ContingencyAmount, styleClass: 'text-right' },
    ];

    sortOrder: StOrder;
    loading: boolean = true;
    localStorageName: string;
    showError: boolean = false;
    sendResponse: SendToEOneResponseMessageDTO;

	constructor(private contractsService: ContractsService, @Inject('ORIGIN_URL') private originUrl: string ) {
      this.localStorageName = ContractsComponent.STORAGE;
      console.log("We are in the contracts")
   }

  ngOnInit() {
    let paging = localStorage.getItem(this.localStorageName);
    this.sortOrder = paging ? JSON.parse(paging) : new StOrder("contractNumber", 'asc');
    this.refreshTable();
  }

    //
    public getServerData(pagein: number) {

        this.p = pagein;

        this.refreshTable();

        this.p = this.contractTransactionsResponse.CurrentPage;

        return event;
    }

    refreshTable() {
        console.log("We are calling contracts service to get the list.")

        this.loading = true;
        this.contractsService.query(this.p)
            .subscribe(
            ccs => {
                this.contractTransactionsResponse = ccs;
                this.p = this.contractTransactionsResponse.CurrentPage;
                this.totalPages = this.contractTransactionsResponse.TotalPages;
                this.totalItems = this.contractTransactionsResponse.TotalItems;
                this.transactions = this.contractTransactionsResponse.ContractTransactionsList.sort(this.columns.find(c => c.field == this.sortOrder.property).function);
                this.loading = false;
            },
            error => {
                console.log(error);
                this.loading = false;
            }
            );
    }

  viewReport = (trx: Contract) => {
    console.log("We are calling contracts service to view the report.")

    this.contractsService
    .viewReport(trx)
    .subscribe(
    resp => console.log(resp),
    error => console.log(error));
  }

  sendToEone = (trx: Contract) => {
    console.log("We are calling contracts service to send a transaction to eone.")

    let resp = confirm(`Are you sure you would like to send Change Order ${trx.TransactionNumber} for contract ${trx.ContractNumber} to EnterpriseOne?`);
    if (resp) {
        this.contractsService
            .sendToE1(trx)
            .subscribe(
            resp => {
                console.log("We are in the response logic area");
                console.log(resp);
                this.refreshTable();
                alert('Transaction has been sent to EOne')
				this.sendResponse = resp;
				if (this.sendResponse.ResponseMessage != null && this.sendResponse.ResponseMessage != "Success") {
					alert(this.sendResponse.ResponseMessage);
				}
                //alert(this.sendResponse.ResponseMessage);
            },
            error => {
                this.showError = true;
                console.log(error);
                alert(error);
            });
    }
  }

  changeSort = (prop: string) => {
    this.loading = true;
    this.sortOrder.property = prop;
    this.sortOrder.direction = this.sortOrder.direction == 'asc' ? 'desc' : 'asc';
    localStorage.setItem(this.localStorageName, JSON.stringify(this.sortOrder));
    this.transactions = this.transactions.sort(this.columns.find(c => c.field == this.sortOrder.property).function);
    if (this.sortOrder.direction == 'desc') {
      this.transactions = this.transactions.reverse();
    }
    this.loading = false;
  }

}
