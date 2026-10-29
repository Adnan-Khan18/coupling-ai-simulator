export type CheckStatus = "PASS" | "FAIL" | "INVALID";

export type RigidCouplingInput = {
  powerKW: number;
  speedRPM: number;
  serviceFactor: number;

  allowableShaftShearMPa: number;
  shaftDiameterMM: number;

  hubDiameterMM: number;
  hubLengthMM: number;

  keyWidthMM: number;
  keyHeightMM: number;
  allowableKeyShearMPa: number;
  allowableKeyBearingMPa: number;

  // Flange-bolt inputs
  boltCount: number;
  boltPCDMM: number;
  boltDiameterMM: number;
  allowableBoltShearMPa: number;
};

export type RigidCouplingResults = {
    shaftTorqueCapacityNm: number;
  keyShearTorqueCapacityNm: number;
  keyBearingTorqueCapacityNm: number;
  hubTorqueCapacityNm: number;
  boltTorqueCapacityNm: number;
  limitingTorqueCapacityNm: number;
  torqueCapacitySafetyFactor: number;
  torqueCapacityStatus: CheckStatus;
  transmittedTorqueNm: number;
  designTorqueNm: number;

  requiredShaftDiameterMM: number;
  shaftShearStressMPa: number;
  shaftStatus: CheckStatus;

  keyShearStressMPa: number;
  keyBearingStressMPa: number;
  keyShearStatus: CheckStatus;
  keyBearingStatus: CheckStatus;
  keyLengthForShearMM: number;
  keyLengthForBearingMM: number;
  minimumKeyLengthMM: number;

  hubTorsionalStressMPa: number;
  hubStatus: CheckStatus;

  boltForceN: number;
  boltShearStressMPa: number;
  boltStatus: CheckStatus;

  overallStatus: CheckStatus;
};

function positiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Preliminary rigid-coupling calculations.
 *
 * Checks included:
 * 1. Solid shaft under pure torsion.
 * 2. One parallel key in shear and bearing (idealized uniform loading).
 * 3. Annular hub under torsion (keyway stress concentration excluded).
 * 4. Flange bolts under nominal single shear with equal load sharing.
 *
 * Units:
 * Power: kW
 * Speed: rpm
 * Torque: N·m externally, N·mm internally
 * Dimensions: mm
 * Force: N
 * Stress: MPa = N/mm²
 *
 * IMPORTANT:
 * PASS means only that the checks implemented here pass. It is not
 * certification of the complete coupling. Flange bending, bolt-hole
 * bearing, fatigue, stress concentrations, fit, manufacturing tolerances,
 * and any manufacturer-specific ratings are not checked here.
 */
export function calculateRigidCoupling(
  input: RigidCouplingInput
): RigidCouplingResults {
  const {
    powerKW,
    speedRPM,
    serviceFactor,
    allowableShaftShearMPa,
    shaftDiameterMM: d,
    hubDiameterMM: D,
    hubLengthMM: L,
    keyWidthMM: b,
    keyHeightMM: h,
    allowableKeyShearMPa,
    allowableKeyBearingMPa,
    boltCount,
    boltPCDMM,
    boltDiameterMM,
    allowableBoltShearMPa,
  } = input;

  const numericInputs = [
    powerKW,
    speedRPM,
    serviceFactor,
    allowableShaftShearMPa,
    d,
    D,
    L,
    b,
    h,
    allowableKeyShearMPa,
    allowableKeyBearingMPa,
    boltPCDMM,
    boltDiameterMM,
    allowableBoltShearMPa,
  ];

  if (
    !numericInputs.every(positiveFinite) ||
    !Number.isInteger(boltCount) ||
    boltCount < 1 ||
    serviceFactor < 1 ||
    D <= d ||
    b >= d ||
    h >= d ||
    b >= D ||
    h >= D ||
    boltPCDMM <= D ||
    boltDiameterMM >= boltPCDMM
  ) {
    throw new Error(
      "Invalid input. Use positive finite values, service factor >= 1, an integer bolt count, hub diameter > shaft diameter, and bolt PCD > hub diameter."
    );
  }

  // 1. Torque: T(N·m) = 9550 × P(kW) / N(rpm).
  const transmittedTorqueNm = (9550 * powerKW) / speedRPM;
  const designTorqueNm = transmittedTorqueNm * serviceFactor;
  const T = designTorqueNm * 1000; // N·mm
    // Preliminary component torque capacities, converted to N·m.
  // Key engagement length is assumed to equal hub length L.

  const shaftTorqueCapacityNm =
    (Math.PI * allowableShaftShearMPa * d ** 3) / 16 / 1000;

  const keyShearTorqueCapacityNm =
    (allowableKeyShearMPa * d * b * L) / 2 / 1000;

  const keyBearingTorqueCapacityNm =
    (allowableKeyBearingMPa * d * h * L) / 4 / 1000;

  const hubPolarMomentForCapacity =
    (Math.PI / 32) * (D ** 4 - d ** 4);

  const hubTorqueCapacityNm =
    (allowableShaftShearMPa * hubPolarMomentForCapacity) /
    (D / 2) / 1000;

  const boltAreaForCapacity =
    (Math.PI * boltDiameterMM ** 2) / 4;

  const boltTorqueCapacityNm =
    (allowableBoltShearMPa *
      boltAreaForCapacity *
      boltCount *
      boltPCDMM) / 2 / 1000;

  const limitingTorqueCapacityNm = Math.min(
    shaftTorqueCapacityNm,
    keyShearTorqueCapacityNm,
    keyBearingTorqueCapacityNm,
    hubTorqueCapacityNm,
    boltTorqueCapacityNm
  );

  const torqueCapacitySafetyFactor =
    limitingTorqueCapacityNm / designTorqueNm;

  const torqueCapacityStatus: CheckStatus =
    limitingTorqueCapacityNm >= designTorqueNm ? "PASS" : "FAIL";

  // 2. Solid shaft under pure torsion:
  // T = (π/16) τ d³  =>  d = cube_root(16T / (πτ)).
  const requiredShaftDiameterMM = Math.cbrt(
    (16 * T) / (Math.PI * allowableShaftShearMPa)
  );

  const shaftShearStressMPa = (16 * T) / (Math.PI * d ** 3);
  const shaftStatus: CheckStatus =
    shaftShearStressMPa <= allowableShaftShearMPa ? "PASS" : "FAIL";

  // 3. One parallel key; tangential force F = 2T/d.
  // Shear area = bL; effective bearing area = (h/2)L.
  const keyShearStressMPa = (2 * T) / (d * b * L);
  const keyBearingStressMPa = (4 * T) / (d * h * L);

  const keyLengthForShearMM =
    (2 * T) / (d * b * allowableKeyShearMPa);

  const keyLengthForBearingMM =
    (4 * T) / (d * h * allowableKeyBearingMPa);

  const minimumKeyLengthMM = Math.max(
    keyLengthForShearMM,
    keyLengthForBearingMM
  );

  const keyShearStatus: CheckStatus =
    keyShearStressMPa <= allowableKeyShearMPa ? "PASS" : "FAIL";

  const keyBearingStatus: CheckStatus =
    keyBearingStressMPa <= allowableKeyBearingMPa ? "PASS" : "FAIL";

  // 4. Annular hub approximation; keyway/local stress concentrations omitted.
  // J = π(D⁴ - d⁴)/32; τmax = T(D/2)/J.
  const hubPolarMoment = (Math.PI / 32) * (D ** 4 - d ** 4);
  const hubTorsionalStressMPa = (T * (D / 2)) / hubPolarMoment;

  // Preliminary comparison only; a hub-specific allowable may be needed.
  const hubStatus: CheckStatus =
    Number.isFinite(hubTorsionalStressMPa) &&
    hubTorsionalStressMPa <= allowableShaftShearMPa
      ? "PASS"
      : "FAIL";

  // 5. Flange bolts in nominal single shear.
  // Tangential force per bolt = T / (n × radius) = 2T/(n × PCD).
  const boltForceN = (2 * T) / (boltCount * boltPCDMM);
  const boltAreaMM2 = (Math.PI * boltDiameterMM ** 2) / 4;
  const boltShearStressMPa = boltForceN / boltAreaMM2;

  const boltStatus: CheckStatus =
    boltShearStressMPa <= allowableBoltShearMPa ? "PASS" : "FAIL";

  // Overall status covers only the component checks implemented above.
  const componentStatuses: CheckStatus[] = [
    shaftStatus,
    keyShearStatus,
    keyBearingStatus,
    hubStatus,
    boltStatus,
  ];

  const overallStatus: CheckStatus = componentStatuses.includes("FAIL")
    ? "FAIL"
    : componentStatuses.every((status) => status === "PASS")
      ? "PASS"
      : "INVALID";

  return {
    transmittedTorqueNm,
    designTorqueNm,
    requiredShaftDiameterMM,
    shaftShearStressMPa,
    shaftStatus,
    keyShearStressMPa,
    keyBearingStressMPa,
    keyShearStatus,
    keyBearingStatus,
    keyLengthForShearMM,
    keyLengthForBearingMM,
    minimumKeyLengthMM,
    hubTorsionalStressMPa,
    hubStatus,
    boltForceN,
    boltShearStressMPa,
    boltStatus,
    overallStatus,
    shaftTorqueCapacityNm,
    keyShearTorqueCapacityNm,
    keyBearingTorqueCapacityNm,
    hubTorqueCapacityNm,
    boltTorqueCapacityNm,
    limitingTorqueCapacityNm,
    torqueCapacitySafetyFactor,
    torqueCapacityStatus,
  };
}
