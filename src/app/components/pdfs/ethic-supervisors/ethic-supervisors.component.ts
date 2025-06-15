import { Component, OnInit } from '@angular/core';
import { SafeurlPipe } from '@pipes/safeurl.pipe'

@Component({
  selector: 'app-ethic-supervisors',
  standalone: true,
  imports: [SafeurlPipe],
  templateUrl: './ethic-supervisors.component.html',
  styleUrl: './ethic-supervisors.component.css'
})
export class EthicSupervisorsComponent {

  pdfUrl: string = 'assets/pdfs/ethics-supervisors.pdf'; // Reemplaza con la URL real de tu PDF


  constructor() {}

  ngOnInit(): void {
    // Si la URL del PDF es dinámica, puedes obtenerla aquí (por ejemplo, desde un parámetro de la ruta)
    // this.route.queryParams.subscribe(params => {
    //   this.pdfUrl = params['url'];
    // });
  }


}
