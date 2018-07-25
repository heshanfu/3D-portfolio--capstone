import * as THREE from 'three'
import TWEEN from "tween";

export default function cloud(this) {
    var cloudGroup;
    var particlesData = [];
    var positions, colors;
    var particles;
    var pointCloud;
    var particlePositions;
    var linesMesh;
    var maxParticleCount = 1000;
    var particleCount = 500;
    var r = 800;
    var rHalf = r / 2;
    var effectController = {
        showDots: true,
        showLines: true,
        minDistance: 150,
        limitConnections: false,
        maxConnections: 20,
        particleCount: 500
    }


    this.cloudGroup = new THREE.Group();
    this.scene.add(this.cloudGroup);
    var helper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxBufferGeometry(r, r, r)));
    helper.material.color.setHex(0x080808);
    helper.material.blending = THREE.AdditiveBlending;
    helper.material.transparent = true;
    this.cloudGroup.add(helper);
    var segments = maxParticleCount * maxParticleCount;
    positions = new Float32Array(segments * 3);
    colors = new Float32Array(segments * 3);
    var pMaterial = new THREE.PointsMaterial({
        color: 0x000000,
        size: 3,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false
    });
    particles = new THREE.BufferGeometry();
    particlePositions = new Float32Array(maxParticleCount * 3);
    for (var i = 0; i < maxParticleCount; i++) {
        var x = Math.random() * r - r / 2;
        var y = Math.random() * r - r / 2;
        var z = Math.random() * r - r / 2;
        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;
        // add it to the geometry
        particlesData.push({
            velocity: new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2),
            numConnections: 0
        });
    }
    particles.setDrawRange(0, particleCount);
    particles.addAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setDynamic(true));
    // create the particle system
    pointCloud = new THREE.Points(particles, pMaterial);
    this.cloudGroup.add(pointCloud);
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3).setDynamic(true));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3).setDynamic(true));
    geometry.computeBoundingSphere();
    geometry.setDrawRange(0, 0);
    var material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    linesMesh = new THREE.LineSegments(geometry, material);
    this.cloudGroup.add(linesMesh);
    //

    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    //
    var vertexpos = 0;
    var colorpos = 0;
    var numConnected = 0;
    for (var i = 0; i < particleCount; i++)
        particlesData[i].numConnections = 0;
    for (var i = 0; i < particleCount; i++) {
        // get the particle
        var particleData = particlesData[i];
        particlePositions[i * 3] += particleData.velocity.x;
        particlePositions[i * 3 + 1] += particleData.velocity.y;
        particlePositions[i * 3 + 2] += particleData.velocity.z;
        if (particlePositions[i * 3 + 1] < -rHalf || particlePositions[i * 3 + 1] > rHalf)
            particleData.velocity.y = -particleData.velocity.y;
        if (particlePositions[i * 3] < -rHalf || particlePositions[i * 3] > rHalf)
            particleData.velocity.x = -particleData.velocity.x;
        if (particlePositions[i * 3 + 2] < -rHalf || particlePositions[i * 3 + 2] > rHalf)
            particleData.velocity.z = -particleData.velocity.z;
        if (effectController.limitConnections && particleData.numConnections >= effectController.maxConnections)
            continue;
        // Check collision
        for (var j = i + 1; j < particleCount; j++) {
            var particleDataB = particlesData[j];
            if (effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections)
                continue;
            var dx = particlePositions[i * 3] - particlePositions[j * 3];
            var dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
            var dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
            var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < effectController.minDistance) {
                particleData.numConnections++;
                particleDataB.numConnections++;
                var alpha = 1.0 - dist / effectController.minDistance;
                positions[vertexpos++] = particlePositions[i * 3];
                positions[vertexpos++] = particlePositions[i * 3 + 1];
                positions[vertexpos++] = particlePositions[i * 3 + 2];
                positions[vertexpos++] = particlePositions[j * 3];
                positions[vertexpos++] = particlePositions[j * 3 + 1];
                positions[vertexpos++] = particlePositions[j * 3 + 2];
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                numConnected++;
            }
        }
    }
    linesMesh.geometry.setDrawRange(0, numConnected * 2);
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;
    pointCloud.geometry.attributes.position.needsUpdate = true;
}

