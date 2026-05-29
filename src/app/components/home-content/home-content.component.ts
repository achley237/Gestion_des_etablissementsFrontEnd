import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-content.component.html'
})
export class HomeContentComponent {
  // Vos données d'établissements dynamiques (mockées depuis le fichier d'origine)
  schools = [
    {
      name: 'Lycée Louis-le-Grand',
      category: "Lycée d'Excellence",
      location: 'Paris, France',
      rating: '4.9',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw-j5gt6MmrqgwnTezNNXdEBqFxTjAkUMVVXdxTfGLootrpcLBdjQD8abAMkQh1VRxvXL_Hxw3EpjiUNG6N4wL3dZ1FDJL_xuuUula1oSBAAUC3vqhxGvBbI058L_kCZeF9qV5XL8OVBGyPIzLozrWiwwoznh8oDPnqvE8Nl1Inh3hrlC18dXqBeJJD0uQLauLhkso7CbyCQ8gBqaZNDXJZHSsm8OB4BOS2t7Mo4zIoUTAyLtIKCHszQ7buV9OPKTuGdU_Yz-Nm70',
      topRank: true
    },
    {
      name: 'HEC Paris',
      category: 'École Supérieure',
      location: 'Jouy-en-Josas, France',
      rating: '4.7',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALSWtxgdzKXh4W-Cqq_4W2o3Un02po5_crZ4CE8tL1V40p_h5IpKHLP9moK7BdSj-ICJ6hjg69PX2D3nlQfcx-t1h8CeLcwjfJs3osygS-EV0H8HqVS-tKCnQpKwenM16kXo8AeY-1FdRWr9fbwdzAt905kDY3OwAbP6E1j3n0cAEcih7V80be9RDfKAsUNuABa1_znIf9EsNKrgy5HafboRj93RA8a64dLder8VJnpoTlXRNKs-XXHr76ULoPS_YMOun10kr1Ol4',
      topRank: false
    },
    {
      name: 'Collège Stanislas',
      category: 'Collège Privé',
      location: 'Paris, France',
      rating: '4.8',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdEq9MbR90u44nltJkVoQCmIkLEH_qnrE5hEW1bwapvxG3EPzJ0P0Qk9Bkw0zFoZxPLeXZJ8cXDLONBfBJNfT5765IzfKF2CCowAAtIwiL60zmkConAEcWHQftq5q1qt9OGuDNnpPx05hi3AixCsIfGVA4i0G_Van981kk-Yz9NgdrwPkM2NqB40erBaBO_YUpe5rgu_LOgIT-TpA_dPZcvFtGmXTMVbR2QeaRgEDhtn-fSDY2Mgs2B5X6kcRaEh5lTpr6zaXsgEw',
      topRank: false
    }
  ];
}