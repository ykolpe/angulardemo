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

export class RuleDTO
{
    IsValid: boolean;
    RuleHeader: RuleEdit;
    RuleDetail: RuleDetail[] = [];
}

export class RuleHeaderAddData {
    RuleName: string;
    Description: string;
    Justification: string;
    Status: string;
}

export class RuleSearch {
    RuleName: string;
    CreatedBy: string;
    UnApproved: boolean;
    Approved: boolean;
    Archived: boolean;
}

export class RuleDetail {
  MCU: string;
  OBJ: string;
  SUB: string;
  AssetID: string;
  SubLedger: string;
  Percentage: number = 0;
  RuleDetailID: number;
  RuleHeaderID: number;
  TimestampString: string;
}
export class RuleEditor
{
    _createdBy: string;
}

export class ValidateRuleData
{
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

export interface RuleHeaderListResponse
{
    TotalPages: number;
    PageSize: number;
    TotalItems: number;
    CurrentPage: number;
    RuleHeaderList: Rule[];
}

@Injectable()
export class RulesService {

	constructor(private http: Http, @Inject('ORIGIN_URL') private originUrl: string) { }

    /// Search for rule headers
    searchRules = (search: RuleSearch, page: number): Observable<RuleHeaderListResponse> => {

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers});

        let approved = search.Approved ? "true" : "false";
        let unapproved = search.UnApproved ? "true" : "false";
        let archived = search.Archived ? "true" : "false";

        console.log("Value for search from the UI: " + search.RuleName + ": " + search.CreatedBy + ": " + search.Approved + ": " + search.UnApproved + ": " + search.Archived + ": " + page);

        if (search.RuleName == null) { search.RuleName = ""; }

        if (search.CreatedBy == null) { search.CreatedBy = ""; }

        let searchString = search.RuleName + ";" + search.CreatedBy + ";" + approved + ";" + unapproved + ";" + archived;
        let sortExpression = "RuleName";
        let sortDirection = "Asc";

        let mapper = (res: Response) => {
            let body = res.json();
            return body || [];
        }

        console.log(search.RuleName + ": " + search.CreatedBy + ": " + search.Approved + ": " + search.UnApproved + ": " + search.Archived);

        console.log(searchString);

		return this.http.get(`${this.originUrl}/rulesadmin/api/admin/${searchString.trim()}/${sortExpression.trim()}/${sortDirection.trim()}/${page}`, options)
            .map(mapper)
            .catch(this.handleError);
    }

    /// Get the Rule Header and its Details by ID
    get = (ruleHeaderID: number): Observable<RuleDTO> => {

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers});

        console.log("We are in the rule service get rule data.")

        let mapper = (res: Response) => {
            console.log(res.json());

            let body = res.json();
            //return body ? body.response.projectInfo.projectName.sort((p1, p2) => p1.localeCompare(p2)) : [];
            return body || [];

        }

        console.log(" Rule Header ID: " + ruleHeaderID)

		return this.http.get(`${this.originUrl}/rulesadmin/api/admin/${ruleHeaderID}`, options)
            .map(mapper)
        .catch(this.handleError);
    }

    /// Get a list of Rule Header Account Names
    getCreators = (): Observable<RuleEditor[]> => {

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers});

        //    return this.testRule();
		return this.http.get(`${ this.originUrl }/rulesadmin/api/admin`, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    /// Search the list of Rule Headers
    query = (pageable: StPageable, filter: any): Observable<StPage<Rule>> => {

        // return this.testRules();
		return this.http.get(`${this.originUrl}/rulesadmin/api/admin/`, { params: { pageable: pageable, filter: filter } })
        .map(this.extractData)
        .catch(this.handleError);
    }

    // update rule header data
    updateRule = (editrule: RuleEdit): Observable<RuleEdit> =>
    {
        console.log("We are in the rule service method for calling the rest service for updating data.");

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers});

        let mapper = (res: Response) => {
            let body = res.json();
            return body || new RuleEdit();
        }

        console.log(editrule.RuleName);

        let body = JSON.stringify(editrule);

        console.log("This is the value in the body object: " + body);

        console.log("We are calling the rest service for inserting data.");

        return this.http.put(`${this.originUrl}/rulesadmin/api/admin/`, body, options)
            .map(mapper)
            .catch(this.handleError);

    }

    /// Insert new Rule Header
    insertRuleHeader = (rld: RuleHeaderAddData): Observable<Rule> => {

        console.log("We are in the rule service method for calling the rest service for inserting data.");

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers});

        let mapper = (res: Response) => {
            let body = res.json();
            return body || new Rule();
        }

        console.log(rld);

        let body = JSON.stringify(rld);

        console.log("This is the value in the body object: " + body);

        console.log("We are calling the rest service for inserting data.");

        return this.http.post(`${this.originUrl}/rulesadmin/api/admin/`, body, options)
            .map(mapper)
            .catch(this.handleError);
    }

    /// Delete the selected Rule Header record
    deleteRuleHeader = (ruleld: number, timeStamp: string): Observable<boolean> => {

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers});

        console.log("We are in the rule service method for calling the rest service for deleteing data.");

        console.log("We are calling the rest service for deleteing data.");

        console.log("Rule ID: " + ruleld.toString() + " TimeStamp: " + timeStamp.toString());

        return this.http.delete(`${this.originUrl}/rulesadmin/api/admin/${ruleld}/${timeStamp}`, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    /// Validate Rule Header Data
    validateRuleHeader = (ruleId: number, status: string): Observable<ValidateResponse> => {

        console.log("We are in the rule service method for calling the rest service for deleteing data.");

        console.log("We are calling the rest service for deleteing data.");

        console.log("Rule ID: " + ruleId.toString() + " TimeStamp: " + status.toString());

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers});

        let mapper = (res: Response) => {
            let body = res.json();
            return body || new Rule();
        }

        let validateRule = new ValidateRuleData;

        validateRule.RuleHeaderID = ruleId;
        validateRule.newStatus = status;

        let body = JSON.stringify(validateRule);

        return this.http.post(`${this.originUrl}/rulesadmin/api/admin/Validate`, body, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    actionRuleHeader = (editrule: RuleEdit): Observable<ActionRuleResponse> => {
        console.log("We are in the rule service method for calling the rest service for updating data.");

        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        let options = new RequestOptions({ headers: headers});

        let mapper = (res: Response) => {
			let body = res.json();
			
            return body || new RuleEdit();
        }

        let actionRule = new ActionRuleData;

        actionRule.RuleHeaderID = editrule.RuleHeaderID;
        actionRule.TimestampString = editrule.TimestampString;
        actionRule.NewStatus = this.GetActionDisplayValue(editrule.Status);

        console.log(editrule.RuleName);
		console.log(headers, options);
        let body = JSON.stringify(actionRule);

        console.log("This is the value in the body object: " + body);

        console.log("We are calling the rest service for inserting data.");

		return this.http.post(`${this.originUrl}/rulesadmin/api/admin/Action`, body, options)
			.map(this.extractData)
            .catch(this.handleError);
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

    /// Handle Errors method
    public handleError(error: Response | any) {

    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
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
