import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { ForestService } from '../../_services/forest.service';

@Injectable()
export class ForestResolver implements Resolve<any> {
  constructor(private service: ForestService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const id = route.paramMap.get('id');

    return this.service.getForestWithContent(id).catch(err => {
      return Observable.of(null);
    });
  }
}
