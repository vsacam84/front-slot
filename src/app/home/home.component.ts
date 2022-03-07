import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  NgZone,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AccountService, AlertService } from '@app/_services';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { User } from '@app/_models';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-slotmachine',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false })
  canvas: ElementRef<HTMLCanvasElement>;
  private userSubject: BehaviorSubject<User>;
  ctx: CanvasRenderingContext2D;

  // Las entradas y salidas
  @Input() message: string; // El valor que desea animar - El mensaje que se muestra
  @Input() options: any = {}; // opciones para configurar
  @Output() completed = new EventEmitter<void>(); // onComplete emit done

  // Opciones de configuración
  text = [];
  chars = [...'1234']; // Todos los personajes posibles
  scale = 60; // Tamaño de fuente y escala general
  breaks = 0.003; // Pérdida de velocidad por cuadro
  endSpeed = 0.05; // Velocidad a la que se detiene la letra
  firstLetter = 220; // Número de fotogramas hasta que se detiene la primera letra (60 fotogramas por segundo)
  delay = 40; // Número de fotogramas entre letras deteniéndose
  disbleb1: boolean;
  // Opciones no configurables
  charMap = [];
  offset = [];
  offsetV = [];

  myRequestId;
  userP: any;
  con0: boolean;
  con1: boolean;
  con2: boolean;
  con3: boolean;
  con4: boolean;
  con5: boolean;
  disable2: boolean;
  constructor(
    private ngZone: NgZone,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.disbleb1 = false;
    console.log('onInit');
    this.userSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('user'))
    );
    this.con0 = true;
    this.con1 = false;
    this.con2 = false;
    this.con3 = false;
    this.con4 = false;
  }

  async play() {
    this.checkMessage();
  }

  ngAfterViewInit() {
    console.log('afterViewInit');
    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.myRequestId);
    console.log('onDestroy');
  }

  private checkMessage() {

    this.accountService.user.subscribe((x) => (this.userP = x));

    let credit = this.userP.detailUsers[0].credito;

    if(credit == 0){

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ya no tiene créditos para seguir jugando!'
      })

      return false;
    }

    this.accountService
      .play(this.userP.detailUsers[0].credito)
      .pipe(first())
      .subscribe({
        next: (data) => {
          // get return url from query parameters or default to home page

          this.userP.detailUsers[0].credito = data.credito;
          localStorage.setItem('user', JSON.stringify(this.userP));
          this.userSubject.next(this.userP);

          this.message = data.valor;
          console.log('this.message', this.message);
          if (this.message) {
            this.text = [...this.message.toUpperCase()];
          }

          this.addSettings();
          console.log('afterViewInit');
          this.ctx = this.canvas.nativeElement.getContext('2d');

          this.animate();
        },
        error: (error) => {
          this.alertService.error(error);
        },
      });
  }

  private addSettings(): void {
    for (var i = 0; i < this.chars.length; i++) {
      this.charMap[this.chars[i]] = i;
    }

    for (var i = 0; i < this.text.length; i++) {
      var f = this.firstLetter + this.delay * i;
      this.offsetV[i] = this.endSpeed + this.breaks * f;
      this.offset[i] = (-(1 + f) * (this.breaks * f + 2 * this.endSpeed)) / 2;
    }
  }

  private animate(): void {
    this.ngZone.runOutsideAngular(() => {
      this.myRequestId = requestAnimationFrame(() => this.step());
    });
  }

  private step(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = '#ffff'; // the focus point colour
    this.ctx.fillRect(
      0,
      (this.ctx.canvas.height - this.scale) / 2,
      this.ctx.canvas.width,
      this.scale
    );

    var img = new Image();
    img.src =
      'https://firebasestorage.googleapis.com/v0/b/skillsoft-ea998.appspot.com/o/cereza.png?alt=media';
    var img1 = new Image();
    img1.src =
      'https://firebasestorage.googleapis.com/v0/b/skillsoft-ea998.appspot.com/o/lemon.png?alt=media';
    var img2 = new Image();
    img2.src =
      'https://firebasestorage.googleapis.com/v0/b/skillsoft-ea998.appspot.com/o/orange.png?alt=media';
    var img3 = new Image();
    img3.src =
      'https://firebasestorage.googleapis.com/v0/b/skillsoft-ea998.appspot.com/o/watermelon.png?alt=media';

    var images = [
      img,
      img1,
      img2,
      img3,
      img,
      img1,
      img2,
      img3,
      img,
      img1,
      img2,
      img3,
    ];

    let running = false; // this flag to stop requestAnimationFrame
    for (var i = 0; i < this.text.length; i++) {
      var o = this.offset[i];
      while (o < 0) o++;
      o %= 1;
      var h = Math.ceil(this.ctx.canvas.height / 2 / this.scale);
      for (var j = -h; j < h; j++) {
        var c = this.charMap[this.text[i]] + j - Math.floor(this.offset[i]);
        while (c < 0) c += this.chars.length;
        c %= this.chars.length;
        var s =
          1 - Math.abs(j + o) / (this.ctx.canvas.height / 2 / this.scale + 1);
        this.ctx.globalAlpha = s;

        this.ctx.drawImage(
          images[c],
          this.scale * i + 70,
          (j + o + 0.2) * this.scale + 35
        );
      }
      this.offset[i] += this.offsetV[i];
      this.offsetV[i] -= this.breaks;
      if (this.offsetV[i] < this.endSpeed) {
        this.offset[i] = 0;
        this.offsetV[i] = 0;
      } else {
        running = true;
      }
    }

    if (running) {
      this.myRequestId = requestAnimationFrame(() => this.step());
      // console.log("myRequestId", this.myRequestId);
    } else {
      cancelAnimationFrame(this.myRequestId);

      this.completed.emit();

      console.log('onComplete');
    }
  }

  change() {
    this.disable2 = false;

    var ran = Math.floor(Math.random() * 10 + 1);
    console.log(ran);

    if (ran == 1 || ran == 2 || ran == 3 || ran == 4 || ran == 5) {
      //aqui hay 50% de probabilidad de que se mueva para alguno de los lados

      // saco un aleatorio para ver a donde se va a mover

      var ran2 = Math.floor(Math.random() * 4 + 1);
      if (ran2 == 1) {
        console.log(
          'entra en el ++++++++++++++++++++++++++++++++++++++++++++++   1'
        );
        this.con0 = false;
        this.con1 = true;
        this.con2 = false;
        this.con3 = false;
        this.con4 = false;
        this.disable2 = false;
      }
      if (ran2 == 2) {
        console.log(
          'entra en el ++++++++++++++++++++++++++++++++++++++++++++++   2'
        );
        this.con0 = false;
        this.con1 = false;
        this.con2 = true;
        this.con3 = false;
        this.con4 = false;
        this.disable2 = false;
      }
      if (ran2 == 3) {
        console.log(
          'entra en el ++++++++++++++++++++++++++++++++++++++++++++++   3'
        );
        this.con0 = false;
        this.con1 = false;
        this.con2 = false;
        this.con3 = true;
        this.con4 = false;
        this.disable2 = false;
      }
      if (ran2 == 4) {
        console.log(
          'entra en el ++++++++++++++++++++++++++++++++++++++++++++++   4'
        );
        this.con0 = false;
        this.con1 = false;
        this.con2 = false;
        this.con3 = false;
        this.con4 = true;
        this.disable2 = false;
      }
    } else {
      if (ran == 6 || ran == 7 || ran == 8 || ran == 9) {
        this.con0 = true;
        this.con1 = false;
        this.con2 = false;
        this.con3 = false;
        this.con4 = false;
        this.disable2 = true;
      }
    }
  }


  cashout(){

    console.log("Salir.....")

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Estas seguro de salir, sus crédito pasaran a su cuenta?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Generado correctamente!',
          'Sus Créditos fueron enviado a su cuenta.',
          'success'
        )

          this.accountService.logout();

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelado',
          'Puedes seguir jugando.. :)',
          'error'
        )
      }
    })
  }
}
