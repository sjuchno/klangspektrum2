import * as fromCore from '@app/core/store'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { AddMeta } from '@app/core/store/meta.actions'
import { Injectable } from '@angular/core'
import { Meta } from '@app/shared/models/meta.model'
import { Store } from '@ngrx/store'

@Injectable({
  providedIn: 'root'
})
export class MetaGuard implements CanActivate {
  constructor(private router: Router, private store: Store<fromCore.State>) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.getMeta().pipe(
      map((meta: Meta) => {
        const valid = this.isValid(meta)
        if (valid) {
          this.store.dispatch(new AddMeta({ ...meta }))
          this.router.navigate(['profile/player'])
        }
        return !valid
      }),
      catchError(() => of(true))
    )
  }

  /**
   * helper to get meta-data out of hash-payload
   * @return Observable<Meta>
   */
  getMeta(): Observable<Meta> {
    const hash = window.location.hash.substr(1)
    const meta = {} as Meta
    hash.split('&').forEach(a => (meta[a.split('=')[0]] = a.split('=')[1]))
    return of(meta)
  }

  /**
   * helper to validate xsrf-token
   * @return boolean
   * @param state
   */
  isValid(meta: Meta): boolean {
    const xsrf = localStorage.getItem('xsrf-token')
    return xsrf === meta.state && !!meta.access_token
  }
}
