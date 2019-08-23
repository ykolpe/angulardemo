/// <reference path="../shared/services/loader.service.ts" />
import { Component, OnInit,Inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StOrder } from '../st-table/st-table.component';
import { Location } from '@angular/common';
import { AccountsPayable, SendToEOneResponseMessageDTO, AccountsPayableService, AccountsPayableTransactionsResponse } from './accounts-payable.service';

@Component({
    selector: 'accountspayable',
    templateUrl: './accountspayable.component.html',
    styleUrls: ['./accountspayable.component.css'],
    providers: [AccountsPayableService]
})

export class AccountsPayableComponent implements OnInit {
    static STORAGE = "icap-accountspayable.component.page";

    p: number = 1;
    totalPages: number = 0;
    totalItems: number = 0;

    title = "Voucher Review and Processing";
    loading: boolean = true;
    showError: boolean = false;
    accountsPayable: AccountsPayable[] = [];
    selectedAccountsPayable: AccountsPayable;
    gldate: any;
    sendResponse: SendToEOneResponseMessageDTO;
    acctPayableTransactionsResponse: AccountsPayableTransactionsResponse;

    columns = [
        { field: 'glDate', label: 'GL Date', function: (a1, a2) => a1.GLDate.localeCompare(a2.GLDate) },
        { field: 'poNumber', label: 'PO Number', function: (a1, a2) => a1.PoNumber.localeCompare(a2.PoNumber) },
        { field: 'contractNumber', label: 'Contract Number', function: (a1, a2) => a1.ContractNumber.localeCompare(a2.ContractNumber) },
        { field: 'vendorInvoiceNumber', label: 'Vendor Invoice Number', function: (a1, a2) => a1.VendorInvoiceNumber.localeCompare(a2.VendorInvoiceNumber) },
        { field: 'vendorNumber', label: 'Vendor Number', function: (a1, a2) => a1.VendorNumber.localeCompare(a2.VendorNumber) },
        { field: 'description', label: 'Description', function: (a1, a2) => a1.Description.localeCompare(a2.Description) },
        { field: 'integrationStatus', label: 'Status', function: (a1, a2) => a1.Status.localeCompare(a2.Status) },
        { field: 'totalAmount', label: 'Total Amount', function: (a1, a2) => a1.TotalAmount - a2.TotalAmount, styleClass: 'text-right' },
    ];
    sortOrder: StOrder = new StOrder("contractNumber", 'asc');

	constructor(private modalService: NgbModal, @Inject('ORIGIN_URL') private originUrl: string,
        private modal: NgbModal,
        private accountsPayableService: AccountsPayableService, public location: Location) { console.log("We are in the accounts payable.")
        }

    ngOnInit() {
        let paging = localStorage.getItem(AccountsPayableComponent.STORAGE);
        this.sortOrder = paging ? JSON.parse(paging) : new StOrder("contractNumber", 'asc');
        this.refreshTable();
    }

    public getServerData(pagein: number) {

        this.p = pagein;

        this.refreshTable();

        this.p = this.acctPayableTransactionsResponse.CurrentPage;

        return event;
    }

    refreshTable = () => {
        this.loading = true;
        this.showError = false;


        console.log("We are calling accounts payable service to get the list.")
        this.accountsPayableService.query(this.p)
            .subscribe(
            aps => {
                console.log("We are displaying the list of returned trasactions.");
                console.log(aps);
                this.acctPayableTransactionsResponse = aps;
                this.accountsPayable = this.acctPayableTransactionsResponse.AccountTransactionsList;
                this.p = this.acctPayableTransactionsResponse.CurrentPage;
                this.totalPages = this.acctPayableTransactionsResponse.TotalPages;
                this.totalItems = this.acctPayableTransactionsResponse.TotalItems;
                this.loading = false;
            },
            error => {
                console.log(error);
                this.loading = false;
                this.showError = true;
            });
    }

    viewReport = (ap: AccountsPayable) => {
        console.log("We are calling accounts payable service to get report URL.")

        this.accountsPayableService
            .viewReport(ap);
    }

    sendToEone = (ap: AccountsPayable) => {
        console.log("We are calling accounts payable service to get send a transaction to eone.")

        this.accountsPayableService
            .eone(ap)
            .subscribe(
            resp => {
                console.log("We are in the response logic area");
                console.log(resp);
                let sendResponse = <SendToEOneResponseMessageDTO>resp.json();
                if (sendResponse.ResponseMessage != null && sendResponse.ResponseMessage != "Success")
                {
                    alert(sendResponse.ResponseMessage);
                }
                this.refreshTable();
            },
            error => {
                console.log("We are in the error logic area.");
                console.log(error);
                this.showError = true;
                alert(error);
            });
    }


    edit = (content: any, ap: AccountsPayable) => {
        this.selectedAccountsPayable = ap;
        let aDate = new Date(this.selectedAccountsPayable.GLDate);
        this.gldate = {
            year: aDate.getFullYear(),
            month: aDate.getMonth() + 1,
            day: aDate.getDate()
        };
        this.modal.open(content)
            .result.then((result) => {
                this.selectedAccountsPayable.GLDate = new Date(this.gldate.year, this.gldate.month - 1, this.gldate.day);
                this.accountsPayableService
                    .update(this.selectedAccountsPayable)
                    .subscribe(
                    res => {
                        this.refreshTable();
                    },
                    error => {
                        //let errorMessage = JSON.stringify(error);
                        console.log("We are in the error logic area.");
                        console.log(error);
                        this.showError = true;
                        alert(error);
                    });
            }, (reason) => {
                console.log(`Dismissed ${reason}`);
            });
    }

    changeSort = (prop: string) => {
        this.loading = true;
        this.sortOrder.property = prop;
        this.sortOrder.direction = this.sortOrder.direction == 'asc' ? 'desc' : 'asc';
        localStorage.setItem(AccountsPayableComponent.STORAGE, JSON.stringify(this.sortOrder));
        this.accountsPayable = this.accountsPayable
            .sort(this.columns.find(c => c.field == this.sortOrder.property).function);
        if (this.sortOrder.direction == 'desc') {
            this.accountsPayable = this.accountsPayable.reverse();
        }
        this.loading = false;
    }
}
