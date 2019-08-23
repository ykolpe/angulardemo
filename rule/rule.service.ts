import { Injectable,Inject } from '@angular/core';
import { Http, Response, RequestOptions, Headers  } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { StPageable, StPage } from '../st-table/st-table.component';

export class Rule {
    RuleHeaderID: number;
    RuleName: string;
    RuleDescription: string;
    Justification: string;
    CreatedDate: Date;
    Status: string;
    CreatedBy: string;
    TimestampString: string;
    details: RuleDetail[] = [];
}

export class RuleEdit {
    RuleHeaderID: number;
    RuleName: string;
    RuleDescription: string;
    Justification: string;
    CreatedDate: Date;
    Status: string;
    CreatedBy: string;
    TimestampString: string;
    details: RuleDetail[] = [];
}

export class RuleDTO {
    IsValid: boolean;
    RuleHeader: RuleEdit;
    RuleDetails: RuleDetail[] = [];
}

export class RuleHeaderAddData {
    RuleName: string;
    Description: string;
    Justification: string;
    Status: string;
}

export class RuleHeaderUpdateData {
    RuleHeaderID: number;
    RuleName: string;
    RuleDescription: string;
    Justification: string;
    CreatedDate: Date;
    Status: string;
    CreatedBy: string;
    TimestampString: string;
}

export class RuleSearch {
    RuleName: string;
    CreatedBy: string;
    UnApproved: boolean;
    Approved: boolean;
    Archived: boolean;
}

export class RuleDetail {
    MCU: string = "";
    OBJ: string = "";
	SUB: string = "";
	SBL: string;
    AssetID: string = "";
    SubLedger: string = "";
    Percentage: number = 0;
    RuleDetailID: number = 0;
    RuleHeaderID: number = 0;
    TimestampString: string = "";
    Timestamp: any;
}

export class RuleDetailListData {
    MCU: string;
    OBJ: string;
    SUB: string;
    AssetID: string;
    AccountID: string;
    SubLedger: string;
    Percentage: number = 0;
    RuleDetailID: number;
    RuleHeaderID: number;
    TimestampString: string;
    Timestamp: any;
}
export class RuleDetailAddData
{
    MCU: string;
    OBJ: string;
    SUB: string;
    SBL: string;
    AssetId: string;
    Percentage: number;
}

export class RuleDetailUpdateData {
    RuleDetailID: number = 0;
    RuleHeaderID: number = 0;
    MCU: string;
    OBJ: string;
    SUB: string;
    SBL: string;
    AssetID: string;
    Percentage: number;
    TimestampString: string = "";
}

export class RuleEditor {
    _createdBy: string;
}

export class ValidateRuleData {
    RuleHeaderID: number;
    newStatus: string;
}

export class ValidateResponse {
    Result: boolean;
    Message: string;
}

export class ActionRuleData {
    RuleHeaderID: number;
    TimestampString: string;
    NewStatus: string;
}

export class ActionRuleResponse {
    Result: boolean;
    Message: string;
}

export interface RuleDetailListResponse {
    TotalPages: number;
    PageSize: number;
    TotalItems: number;
    CurrentPage: number;
    RuleDetailList: RuleDetail[];
}

export interface RuleHeaderEditResponse {
    TotalPages: number;
    PageSize: number;
    TotalItems: number;
    CurrentPage: number;
    RuleDto: RuleDTO;
}

@Injectable()
export class RuleService {

	constructor(private http: Http, @Inject('ORIGIN_URL') private originUrl: string) { }

    /// Get the Rule Header and its Details by ID
    get = (ruleHeaderID: number, page: number): Observable<RuleHeaderEditResponse> => {

        try {

            console.log("We are in the rule service get rule data.");

            let mapper = (res: Response) => {
                console.log(res.json());

                let body = res.json();
                //return body ? body.response.projectInfo.projectName.sort((p1, p2) => p1.localeCompare(p2)) : [];
                return body || [];
            }

            console.log(" Rule Header ID: " + ruleHeaderID);

			return this.http.get(`${this.originUrl}/rulesadmin/api/admin/${ruleHeaderID}/${page.toString().trim()}`)
                .map(mapper)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    /// Search the list of Rule Headers
    //query = (pageable: StPageable, filter: any): Observable<StPage<Rule>> => {

    //// return this.testRules();
    //return this.http.get("/rulesadmin/api/admin/", { params: { pageable: pageable, filter: filter } })
    //    .map(this.extractData)
    //    .catch(this.handleError);
    //}

    // update rule header data
    updateRule = (editrule: RuleHeaderUpdateData): Observable<RuleEdit> =>
    {
        try {
            console.log("We are in the rule service method for calling the rest service for updating data.");

            let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
            let options = new RequestOptions({ headers: headers, withCredentials: true });

            let mapper = (res: Response) => {

                if (res.status == 304)
                {
                    console.log("We are in the HTTP 304 staus code section.");
                    alert(res.toString()); 
                }
                else
                {
                    console.log("We are setting the body of the return response.");

                    let body = res.json();
                    return body || new RuleEdit();
                }
            }

            console.log(editrule.RuleName);

            let body = JSON.stringify(editrule);

            console.log("This is the value in the body object: " + body);

            console.log("We are calling the rest service for inserting data.");

            return this.http.put(`${this.originUrl}/rulesadmin/api/admin/`, body, options)
                .map(mapper)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    /// Insert new Rule Header
    insertRuleHeader = (rld: RuleHeaderAddData): Observable<Rule> => {

        try {

            console.log("We are in the rule service method for calling the rest service for inserting data.");

            let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
            let options = new RequestOptions({ headers: headers});

            let mapper = (res: Response) => {
                let body = res.json();
                return body || new Rule();
            }

            console.log(rld);

            let addbody = JSON.stringify(rld);

            console.log("This is the value in the body object: " + addbody);

            console.log("We are calling the rest service for inserting data.");

            return this.http.post(`${this.originUrl}/rulesadmin/api/admin/`, addbody, options)
                .map(mapper)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    /// Delete the selected Rule Header record
    deleteRuleHeader = (ruleld: number, timeStamp: string): Observable<boolean> => {

        try {
            console.log("We are in the rule service method for calling the rest service for deleteing data.");

            console.log("We are calling the rest service for deleteing data.");

            console.log("Rule ID: " + ruleld.toString() + " TimeStamp: " + timeStamp.toString());

            return this.http.delete(`${this.originUrl}/rulesadmin/api/admin/${ruleld}/${timeStamp}`)
                .map(this.extractData)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    /// Validate Rule Header Data
    validateRuleHeader = (ruleId: number, status: string): Observable<ValidateResponse> => {

        try {
            console.log("We are in the rule service method for calling the rest service for deleteing data.");

            console.log("We are calling the rest service for deleteing data.");

            console.log("Rule ID: " + ruleId.toString() + " TimeStamp: " + status.toString());

            let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
            let options = new RequestOptions({ headers: headers });

            let mapper = (res: Response) => {
                let body = res.json();
                return body || new Rule();
            }

            let validateRule = new ValidateRuleData;

            validateRule.RuleHeaderID = ruleId;
            validateRule.newStatus = status;

            let validbody = JSON.stringify(validateRule);

            return this.http.post(`${this.originUrl}/rulesadmin/api/admin/Validate`, validbody, options)
                .map(this.extractData)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    actionRuleHeader = (editrule: RuleEdit): Observable<ActionRuleResponse> => {

        try {
            console.log("We are in the rule service method for calling the rest service for updating data.");

            let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
            let options = new RequestOptions({ headers: headers });

            let mapper = (res: Response) => {
                let body = res.json();
                return body || new RuleEdit();
            }

            let actionRule = new ActionRuleData;

            actionRule.RuleHeaderID = editrule.RuleHeaderID;
            actionRule.TimestampString = editrule.TimestampString;
            actionRule.NewStatus = this.GetActionDisplayValue(editrule.Status);

            console.log(editrule.RuleName);

            let actionbody = JSON.stringify(actionRule);

            console.log("This is the value in the body object: " + actionbody);

            console.log("We are calling the rest service for inserting data.");

            return this.http.post(`${this.originUrl}/rulesadmin/api/admin/Action`, actionbody, options)
                .map(mapper)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    GetActionDisplayValue(status: string)
    {
        let rtnVal = "None";

        switch (status) {
            case "Unapproved":
                rtnVal = "Approve";
                break;
            case "Approved":
                rtnVal = "Unapprove";
                break;
            case "Locked":
                rtnVal = "Archive";
                break;
            case "Archived":
                rtnVal = "Locked";
                break;
        }

        return rtnVal;
    } 

    /// Exctract data common method
    public extractData(res: Response) {
        let body = res.json();
        return body || [];
    }

    // get list of rule details for a rule
    getDetails = (ruleHeaderID: number, page: number): Observable<RuleDetailListResponse> => {

        try {
            console.log("We are in the rule service get rule details data.");

            let mapper = (res: Response) => {
                console.log(res.json());

                let body = res.json();
                return body || [];

            }

            let filler = "empty";

            console.log(" Rule Header ID: " + ruleHeaderID);
            console.log(" Rule Detail pagh number: " + page.toString());

            return this.http.get(`${this.originUrl}/rulesadmin/api/details/${filler}/${ruleHeaderID}/${page.toString()}`)
                .map(mapper)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    // get an individual detail record
    getDetail = (ruleHeaderID: number, ruleDetailID: number): Observable<RuleDetailListData> => {

        try {
            console.log("We are in the rule service get rule detail data.");

            console.log(" Rule Header ID: " + ruleHeaderID + " rule Detail: " + ruleDetailID);

            return this.http.get(`${this.originUrl}/rulesadmin/api/details/${ruleHeaderID}/${ruleDetailID}`)
                .map(this.extractData)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    /// Insert new Rule Detail
    insertRuleDetail = (rldt: RuleDetailAddData, id: number): Observable<RuleDetail> => {

        try {

            console.log("We are in the rule service method for calling the rest service for inserting detail data.");

            let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
            let options = new RequestOptions({ headers: headers });

            let mapper = (res: Response) => {
                let body = res.json();
                return body || new Rule();
            }

            console.log(rldt);

            let insbody = JSON.stringify(rldt);

            console.log("This is the value in the body object: " + insbody);

            console.log("We are calling the rest service for inserting detail data.");

            return this.http.post(`${this.originUrl}/rulesadmin/api/details/${id}`, insbody, options)
                .map(mapper)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    // delete rule detail data
    deleteRuleDetail = (detailId: number, ruleld: number, timeStamp: string): Observable<boolean> => {

        try {
            console.log("We are in the rule service method for calling the rest service for deleteing detail data.");

            console.log("We are calling the rest service for deleteing detail data.");

            console.log("Rule Detail ID" + detailId.toString() + "Rule ID: " + ruleld.toString() + " TimeStamp: " + timeStamp.toString());

            return this.http.delete(`${this.originUrl}/rulesadmin/api/details/${detailId}/${ruleld}/${timeStamp.trim()}`)
                .map(this.extractData)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    // update rule detail data
    updateRuleDetail = (editDetail: RuleDetailUpdateData): Observable<RuleDetail> => {

        try {
            console.log("We are in the rule service method for calling the rest service for updating data.");

            let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
            let options = new RequestOptions({ headers: headers});

            let mapper = (res: Response) => {
                let body = res.json();
                return body || new RuleEdit();
            }

            console.log(editDetail.MCU);

            let udtbody = JSON.stringify(editDetail);

            console.log("This is the value in the body object: " + udtbody);

            console.log("We are calling the rest service for updating data.");

            return this.http.put(`${this.originUrl}/rulesadmin/api/details/`, udtbody, options)
                .map(mapper)
                .catch(this.handleError);

        } catch (e) {
            alert(e.message);
        }
    }

    /// Handle Errors method
    public handleError(error: Response | any) {

    console.log("We are in the handleError method");

    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {

        console.log("In the error instanceof logic, the error status is: " + error.status + " Message: " + error.text.toString());

        const body = error.json() || '';
        const err = body.error || JSON.stringify(body);
        errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
        errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
    }

  public testRule = () => {
    let rule = new Rule();
    rule.RuleName = "P123.1234.123";
    return Observable.create(observer => {
      observer.next(rule);
      observer.complete();
    });
  }

  public testRules = (): Observable<StPage<Rule>> => {
    let list = [];
    for (let i = 0; i < 25; i++) {
      let str = "" + (10 * Math.random()).toFixed(0);
      let pad = "00";
      let ans = pad.substring(0, pad.length - str.length) + str;

      let str2 = "" + + (100 * Math.random()).toFixed(0);
      let pad2 = "000";
      let ans2 = pad2.substring(0, pad2.length - str2.length) + str2;

      let rule = new Rule();
      rule.RuleHeaderID = i;
      rule.RuleName = `P90687.${ans}.${ans2}`;
      list.push(rule);
    }

    let page = new StPage<Rule>();
    page.content = list;

    return Observable.create(observer => {
      observer.next(page);
      observer.complete();
    });
  }
}
