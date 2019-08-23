import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StOrder } from '../st-table/st-table.component';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RuleChange, RuleChangeReviewService, RuleReviewTransactionsResponse } from '../rule-change-review/rule-change-review.service';
import { ICAPSafeStringCompare } from '../app.settings';

@Component({
  selector: 'rulechangereview',
  templateUrl: './rule-change-review.component.html',
  styleUrls: ['./rule-change-review.component.css'],
  providers: [RuleChangeReviewService]
})
export class RuleChangeReviewComponent implements OnInit {
  static STORAGE = "icap.rule-change-review.page";


    p: number = 1;
    totalPages: number = 0;
    totalItems: number = 0;

    ruleReviewTransactionsResponse: RuleReviewTransactionsResponse;

  title = "Rule Change Review and Processing";
  transactions: RuleChange[] = [];
  columns = [
    { field: 'poNumber', label: 'PO Number', function: (a1, a2) => ICAPSafeStringCompare(a1.PoNumber, a2.PoNumber) },
    { field: 'reqNumber', label: 'Req Number', function: (a1, a2) => ICAPSafeStringCompare(a1.ReqNumber, a2.ReqNumber) },
    { field: 'contractNumber', label: 'Contract Number', function: (a1, a2) => ICAPSafeStringCompare(a1.ContractNumber, a2.ContractNumber) },
    { field: 'transactionType', label: 'Transaction Type', function: (a1, a2) => ICAPSafeStringCompare(a1.TransactionType, a2.TransactionType) },
    { field: 'transactionNumber', label: 'Transaction Number', function: (a1, a2) => ICAPSafeStringCompare(a1.TransactionNumber, a2.TransactionNumber) },
    { field: 'description', label: 'Description', function: (a1, a2) => ICAPSafeStringCompare(a1.Description, a2.Description) },
    { field: 'integrationStatus', label: 'Status', function: (a1, a2) => ICAPSafeStringCompare(a1.Status, a2.Status) },
    { field: 'totalAmount', label: 'Total Amount', function: (a1, a2) => a1.TotalAmount - a2.TotalAmount, styleClass: 'text-right' },
    { field: 'contingencyAmount', label: 'Contingency Amount', function: (a1, a2) => a1.ContingencyAmount - a2.ContingencyAmount, styleClass: 'text-right' },
  ];

  sortOrder: StOrder;
  loading: boolean = true;
  localStorageName: string;
  showError: boolean = false;

  constructor(private router: Router,
      private modalService: NgbModal,
      private transactionService: RuleChangeReviewService) {

      this.localStorageName = RuleChangeReviewComponent.STORAGE;
      console.log("We are in the rule change component.")
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

        this.p = this.ruleReviewTransactionsResponse.CurrentPage;

        return event;
    }

  refreshTable() {
    this.loading = true;
    this.transactionService.query(this.p)
      .subscribe(
      trxs => {
          this.ruleReviewTransactionsResponse = trxs;
          this.p = this.ruleReviewTransactionsResponse.CurrentPage;
          this.totalPages = this.ruleReviewTransactionsResponse.TotalPages;
          this.totalItems = this.ruleReviewTransactionsResponse.TotalItems;
          this.transactions = this.ruleReviewTransactionsResponse.RuleReviewTransactionsList.sort(this.columns.find(c => c.field == this.sortOrder.property).function);

          this.loading = false;
      },
      error => {
        console.log(error);
        this.loading = false;
      });
  }

  viewReport = (trx: RuleChange) => {
    this.transactionService
      .viewReport(trx)
      .subscribe(
      resp => console.log(resp),
      error => console.log(error));
  }

  sendToEone = (trx: RuleChange) => {
    this.transactionService
      .sendToE1(trx)
      .subscribe(resp => {
        console.log(resp);
		  this.refreshTable();
		  if (resp.statusText != null && resp.statusText != "OK") {
			  alert(resp.statusText);
		  }
        //alert('TRX sent')
      }, error => {
        console.log(error);
        alert(error);
      });
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
