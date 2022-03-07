import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AesCriptography } from 'src/security/aes-criptography';

import { environment } from '@environments/environment';
import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;
  dataUser: any;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login2(username, password) {
        return this.http.post<User>(`${environment.apiUrl}/users/authenticate`, { username, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
                return user;
            }));
    }



    login(username: string, password: string,ip:string) {
      var criptography = new AesCriptography();
      var parametro1 = criptography.encrypt(username);
      var parametro2 = criptography.encrypt(password);
      return this.http.post<any>(`${environment.apiUrl}/users/login-slot?user=${encodeURIComponent(parametro1)}&password=${encodeURIComponent(parametro2)}&ip=0`, { parametro1, parametro2 })
        .pipe(map(user => {
          console.log('USETRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR   ', user)
          localStorage.setItem('token', JSON.stringify(user.token));
          localStorage.setItem('currentUserData', JSON.stringify(user));

          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);


          this.dataUser=user;
          return user;
        }));
    }



    register(username: string, password: string,nombre:string) {
      var criptography = new AesCriptography();

      var parametro2 = criptography.encrypt(password);
      var data={
        id_usuario:username,
        nombre:nombre,
        contrasenia:parametro2
      }
      return this.http.post<any>(`${environment.apiUrl}/users/register-slot`, data)
        .pipe(map(user => {
          console.log('USETRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR   ', user)
          localStorage.setItem('token', JSON.stringify(user.token));
          localStorage.setItem('currentUserData', JSON.stringify(user));
          this.dataUser=user;
          return user;
        }));
    }


    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    register2(user: User) {
        return this.http.post(`${environment.apiUrl}/register-slot`,{});
    }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    getById(id: string) {
        return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/users/${id}`, params)
            .pipe(map(x => {
                // update stored user if the logged in user updated their own record
                if (id == this.userValue.id) {
                    // update local storage
                    const user = { ...this.userValue, ...params };
                    localStorage.setItem('user', JSON.stringify(user));

                    // publish updated user to subscribers
                    this.userSubject.next(user);
                }
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/users/${id}`)
            .pipe(map(x => {
                // auto logout if the logged in user deleted their own record
                if (id == this.userValue.id) {
                    this.logout();
                }
                return x;
            }));
    }
    play(credito: string) {
      var criptography = new AesCriptography();
     var data={
       credito:credito
     }
      return this.http.post<any>(`${environment.apiUrl}/slot/game`,data)
        .pipe(map(data => {

          return data;
        }));
    }
}
