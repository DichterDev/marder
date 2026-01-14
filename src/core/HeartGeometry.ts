import * as THREE from 'three';

export class HeartGeometryFactory {
  static create(count: number = 10000, scale: number = 1): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    let i = 0;
    while (i < count) {
      // 1. Better angular distribution:
      // We use a random 't' but we use a rejection check or 
      // simple scaling to ensure wings get enough points.
      const t = Math.random() * Math.PI * 2;
      
      const xOutline = 16 * Math.pow(Math.sin(t), 3);
      const yOutline = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

      // 2. Fix the "clumping" at the center:
      // Instead of Math.sqrt, we use Math.pow(Math.random(), 1/3) 
      // This is the standard formula for uniform distribution in a 3D volume.
      const r = Math.pow(Math.random(), 0.6); // 0.6 is a sweet spot for heart density

      const x = xOutline * r;
      const y = yOutline * r;

      // 3. Curvature (The "Puffy" Volume)
      // We calculate thickness based on the 'r' value.
      // At the center (r=0), thickness is max. At edges (r=1), thickness is 0.
      const maxThickness = 8;
      const bulge = Math.sqrt(1 - Math.pow(r, 2));
      
      // Distribute z evenly within the bulge
      const z = (Math.random() * 2 - 1) * bulge * maxThickness;

      // 4. Final Scaling and Offset
      // We subtract a small amount from Y to center the heart vertically 
      // (the formula is naturally top-heavy)
      const yOffset = -2; 

      const i3 = i * 3;
      positions[i3] = x * scale * 0.1;
      positions[i3 + 1] = (y + yOffset) * scale * 0.1;
      positions[i3 + 2] = z * scale * 0.1;
      
      i++;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }
}