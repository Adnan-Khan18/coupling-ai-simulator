
"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  Environment,
} from "@react-three/drei";
import { Suspense } from "react";

type Coupling3DProps = {
  couplingType?: "rigid" | "flexible";
  shaftDiameter?: number;
  hubDiameter?: number;
  hubLength?: number;
  boltCount?: number;
};

function RigidCoupling({
  shaftDiameter,
  hubDiameter,
  hubLength,
  boltCount,
}: Required<
  Pick<
    Coupling3DProps,
    "shaftDiameter" | "hubDiameter" | "hubLength" | "boltCount"
  >
>) {
  const shaftR = Math.max(shaftDiameter / 2, 1) / 35;
  const hubR = Math.max(hubDiameter / 2, shaftDiameter / 2 + 1) / 35;
  const hubL = Math.max(hubLength, 5) / 35;
  const flangeR = hubR * 1.45;
  const flangeT = 0.13;
  const gap = 0.12;
  const boltR = Math.max(0.035, shaftR * 0.13);
  const count = Math.max(3, Math.min(12, Math.floor(boltCount)));
  const boltCircleR = flangeR * 0.72;

  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[shaftR, shaftR, 3.7, 48]} />
        <meshStandardMaterial color="#91a8bf" metalness={0.8} roughness={0.28} />
      </mesh>

      {[-1, 1].map((side) => {
        const hubX = side * (gap + hubL / 2);
        const flangeX = side * (gap + hubL + flangeT / 2);

        return (
          <group key={side}>
            <mesh position={[hubX, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[hubR, hubR, hubL, 48]} />
              <meshStandardMaterial color="#8299b2" metalness={0.8} roughness={0.3} />
            </mesh>

            <mesh position={[flangeX, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[flangeR, flangeR, flangeT, 48]} />
              <meshStandardMaterial color="#c2d1e1" metalness={0.85} roughness={0.24} />
            </mesh>

            {Array.from({ length: count }, (_, i) => {
              const angle = (2 * Math.PI * i) / count;
              return (
                <mesh
                  key={i}
                  position={[
                    flangeX,
                    Math.cos(angle) * boltCircleR,
                    Math.sin(angle) * boltCircleR,
                  ]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[boltR, boltR, flangeT * 1.2, 8]} />
                  <meshStandardMaterial color="#e8eef5" metalness={0.8} roughness={0.25} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

function FlexibleCoupling({
  shaftDiameter,
  hubDiameter,
  hubLength,
}: Pick<
  Coupling3DProps,
  "shaftDiameter" | "hubDiameter" | "hubLength"
>) {
  const shaftR = Math.max((shaftDiameter ?? 20) / 2, 1) / 35;
  const hubR = Math.max((hubDiameter ?? 35) / 2, 1) / 35;
  const hubL = Math.max(hubLength ?? 30, 5) / 35;
  const gap = 0.16;
  const spiderR = hubR * 0.82;

  return (
    <group>
      {/* Shafts */}
      {[-1, 1].map((side) => (
        <mesh
          key={`shaft-${side}`}
          position={[side * 0.95, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[shaftR, shaftR, 2.0, 40]} />
          <meshStandardMaterial color="#91a8bf" metalness={0.8} roughness={0.28} />
        </mesh>
      ))}

      {/* Two metal jaw hubs */}
      {[-1, 1].map((side) => (
        <group key={`hub-${side}`} position={[side * (gap + hubL / 2), 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[hubR, hubR, hubL, 40]} />
            <meshStandardMaterial color="#91a8bf" metalness={0.8} roughness={0.28} />
          </mesh>

          {/* Simplified visible jaw blocks */}
          {Array.from({ length: 3 }, (_, i) => {
            const angle = (2 * Math.PI * i) / 3;
            return (
              <mesh
                key={i}
                position={[
                  side * (hubL / 2 + 0.04),
                  Math.cos(angle) * hubR * 0.62,
                  Math.sin(angle) * hubR * 0.62,
                ]}
              >
                <boxGeometry args={[0.16, hubR * 0.48, hubR * 0.48]} />
                <meshStandardMaterial color="#b4c5d8" metalness={0.65} roughness={0.3} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Elastomer spider between the two hubs */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[spiderR, spiderR, 0.22, 6]} />
        <meshStandardMaterial
          color="#18c6bc"
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

export default function Coupling3D({
  couplingType = "rigid",
  shaftDiameter = 20,
  hubDiameter = 35,
  hubLength = 30,
  boltCount = 4,
}: Coupling3DProps) {
  return (
    <div style={{ width: "100%", height: 440, overflow: "hidden", borderRadius: 12, background: "#0b1420" }}>
      <Canvas camera={{ position: [3.4, 2.4, 4.5], fov: 42 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#0b1420"]} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[4, 5, 5]} intensity={2.4} />
        <directionalLight position={[-4, -2, -3]} intensity={1} />

        <Suspense fallback={null}>
          <Environment preset="city" />

          {couplingType === "flexible" ? (
            <FlexibleCoupling
              shaftDiameter={shaftDiameter}
              hubDiameter={hubDiameter}
              hubLength={hubLength}
            />
          ) : (
            <RigidCoupling
              shaftDiameter={shaftDiameter}
              hubDiameter={hubDiameter}
              hubLength={hubLength}
              boltCount={boltCount}
            />
          )}

          <Grid
            position={[0, -1, 0]}
            args={[8, 8]}
            cellSize={0.25}
            cellThickness={0.5}
            cellColor="#294052"
            sectionSize={1}
            sectionThickness={1}
            sectionColor="#3d6078"
            fadeDistance={9}
            infiniteGrid
          />
        </Suspense>

        <OrbitControls makeDefault enableDamping minDistance={2} maxDistance={10} />
      </Canvas>
    </div>
  );
}
