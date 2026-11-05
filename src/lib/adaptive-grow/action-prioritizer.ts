/**
 * GrowAI Phase 11: Action Prioritization Engine
 * Converts recorded garden facts and evidence into a prioritized list of actionable recommendations.
 *
 * CRITICAL SAFETY & AGRONOMIC INVARIANTS:
 * - "critical" priority means prompt grower attention required based on available recorded evidence.
 *   It NEVER means "plant will die" or asserts scientific/medical certainty.
 * - Low-confidence AI hypotheses or uncertain diagnoses are NEVER escalated to critical.
 * - Missing parameters are stated as unrecorded; never assumed unsuitable.
 * - Feeding actions never prescribe dosages; always reference product labels.
 * - Production actions never promise future yields.
 * - Space actions always mandate structural safety verification.
 */

import { AdaptiveGardenInput, GrowAction, ActionCategory, ActionPriority, ActionEvidence } from '@/types/adaptive-grow';
import { PLANTS_DATA } from '@/data/plants';
import { derivePlantHealthStatus } from '@/lib/plant-health-status';

export function prioritizeGardenActions(input: AdaptiveGardenInput): GrowAction[] {
  const {
    plants = [],
    conditions = [],
    feedings = [],
    propagations = [],
    cycles = [],
    harvests = [],
    diagnoses = [],
    reminders = [],
    spaceMetrics,
    referenceDate,
  } = input;

  const now = referenceDate
    ? new Date(referenceDate)
    : typeof window !== 'undefined'
      ? new Date()
      : new Date('2026-11-05T00:00:00.000Z');

  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const actions: GrowAction[] = [];

  const activePlants = plants.filter((p) => p.currentStage !== 'Harvested');

  // ============================================================================
  // 1. HEALTH ACTIONS
  // ============================================================================
  for (const plant of activePlants) {
    const plantDiags = diagnoses.filter((d) => d.userPlantId === plant.id);
    if (plantDiags.length === 0) continue;

    const healthStatus = derivePlantHealthStatus(plantDiags);
    const latestDiag = plantDiags[plantDiags.length - 1];
    const topCandidate = latestDiag.candidates && latestDiag.candidates.length > 0
      ? latestDiag.candidates[0]
      : null;

    const isBiotic = latestDiag.primaryClassification === 'biotic';
    const isHighConfidence = topCandidate ? topCandidate.confidenceCategory === 'high' : false;
    const isAiHypothesis = latestDiag.diagnosticSource === 'gemini-vision';

    const followUps = latestDiag.followUps || [];
    const latestFollowUp = followUps.length > 0 ? followUps[followUps.length - 1] : null;
    const isWorsening = latestFollowUp?.outcomeStatus === 'worsening';
    const isUnresolved = latestFollowUp ? latestFollowUp.outcomeStatus !== 'resolved' : true;

    // Follow-up due check (e.g. 3 days after latest diagnosis or follow-up)
    const lastCheckDate = latestFollowUp ? new Date(latestFollowUp.createdAt) : new Date(latestDiag.createdAt);
    const daysSinceCheck = Math.floor((now.getTime() - lastCheckDate.getTime()) / (1000 * 60 * 60 * 24));
    const followUpIsDue = daysSinceCheck >= 3 && isUnresolved;

    if (healthStatus === 'needs_attention' || isWorsening) {
      // Determine priority: only critical if high-confidence biotic issue or worsening observation
      const priority: ActionPriority = (isBiotic && isHighConfidence) || isWorsening ? 'critical' : 'high';

      const evidence: ActionEvidence[] = [
        {
          source: 'recorded',
          sourceId: latestDiag.id,
          description: `Health assessment logged on ${latestDiag.createdAt.split('T')[0]} indicating ${latestDiag.overallHealth.replace('_', ' ')}.`,
        },
      ];

      if (latestFollowUp) {
        evidence.push({
          source: 'observed',
          sourceId: latestFollowUp.id,
          description: `Follow-up observation noted: ${latestFollowUp.outcomeStatus} (${latestFollowUp.observationNotes || 'no notes'}).`,
        });
      }

      if (topCandidate) {
        evidence.push({
          source: isAiHypothesis ? 'inferred' : 'observed',
          description: `Primary condition observed: ${topCandidate.conditionName} (${topCandidate.confidenceCategory} confidence).`,
        });
      }

      actions.push({
        id: `act-health-attention-${plant.id}-${latestDiag.id}`,
        category: 'health',
        priority,
        title: `${plant.nickname}: Prompt Health Review Required`,
        explanation: `Recent health observations indicate active stress or concerning symptoms requiring grower inspection.`,
        plantId: plant.id,
        plantName: plant.nickname,
        evidence,
        recommendedAction: isAiHypothesis && !isHighConfidence
          ? 'Review the previous observation and consider conducting a physical follow-up inspection.'
          : 'Conduct a follow-up health inspection and verify if symptoms are stabilizing or spreading.',
        route: `/app/my-garden/${plant.id}/health`,
        confidence: isHighConfidence ? 'high' : 'moderate',
      });
    } else if (healthStatus === 'monitoring' && followUpIsDue) {
      actions.push({
        id: `act-health-followup-${plant.id}-${latestDiag.id}`,
        category: 'health',
        priority: 'high',
        title: `${plant.nickname}: Health Follow-Up Inspection Due`,
        explanation: `It has been ${daysSinceCheck} days since the last health observation. A follow-up check helps verify recovery trajectory.`,
        plantId: plant.id,
        plantName: plant.nickname,
        evidence: [
          {
            source: 'recorded',
            sourceId: latestDiag.id,
            description: `Last health record on ${latestDiag.createdAt.split('T')[0]} under monitoring status.`,
          },
          {
            source: 'calculated',
            description: `${daysSinceCheck} days elapsed since last recorded check.`,
          },
        ],
        recommendedAction: 'Inspect foliar tissue and record a follow-up status (improving, unchanged, or worsening).',
        route: `/app/my-garden/${plant.id}/health`,
        confidence: 'high',
      });
    }
  }

  // ============================================================================
  // 2. CARE & REMINDER ACTIONS
  // ============================================================================
  for (const rem of reminders) {
    if (rem.status === 'overdue') {
      actions.push({
        id: `act-care-overdue-${rem.id}`,
        category: 'care',
        priority: 'high',
        title: `Overdue Task: ${rem.title}`,
        explanation: `This task was scheduled for ${rem.dueAt.split('T')[0]} and requires attention.`,
        plantId: rem.plantId || undefined,
        plantName: rem.plantNickname || undefined,
        evidence: [
          {
            source: 'recorded',
            sourceId: rem.id,
            description: `Scheduled reminder due ${rem.dueAt.split('T')[0]} marked overdue.`,
          },
        ],
        recommendedAction: rem.metadata?.actionGuidance || rem.body || 'Review the task details and complete or reschedule when fulfilled.',
        route: rem.metadata?.actionUrl || '/app/grow-intelligence',
        confidence: 'high',
      });
    } else if (rem.status === 'due') {
      actions.push({
        id: `act-care-due-${rem.id}`,
        category: 'care',
        priority: 'medium',
        title: `Scheduled Today: ${rem.title}`,
        explanation: `Task is due today according to garden schedule.`,
        plantId: rem.plantId || undefined,
        plantName: rem.plantNickname || undefined,
        evidence: [
          {
            source: 'recorded',
            sourceId: rem.id,
            description: `Reminder due today: ${rem.title}.`,
          },
        ],
        recommendedAction: rem.metadata?.actionGuidance || rem.body || 'Complete scheduled care activity.',
        route: rem.metadata?.actionUrl || '/app/grow-intelligence',
        confidence: 'high',
      });
    }
  }

  // ============================================================================
  // 3. ENVIRONMENTAL ACTIONS
  // ============================================================================
  for (const plant of activePlants) {
    const plantConds = conditions.filter((c) => !c.plantId || c.plantId === plant.id);
    const botanical = PLANTS_DATA.find((p) => p.slug === plant.plantSlug);

    if (plantConds.length === 0) {
      actions.push({
        id: `act-env-missing-${plant.id}`,
        category: 'environment',
        priority: 'low',
        title: `${plant.nickname}: Environmental Observations Unrecorded`,
        explanation: `No microclimate parameters (temperature, humidity, airflow) have been logged for this plant.`,
        plantId: plant.id,
        plantName: plant.nickname,
        evidence: [
          {
            source: 'recorded',
            description: 'Zero environmental observation records found.',
          },
        ],
        recommendedAction: 'Log current ambient temperature, humidity, and airflow to benchmark against botanical preferences.',
        route: `/app/my-garden?plantId=${plant.id}`,
        confidence: 'high',
      });
    } else {
      const latest = plantConds[plantConds.length - 1];

      // Waterlogged check
      if (latest.soilMoisture === 'waterlogged') {
        actions.push({
          id: `act-env-waterlogged-${plant.id}-${latest.id}`,
          category: 'environment',
          priority: 'high',
          title: `${plant.nickname}: Waterlogged Soil Moisture Observed`,
          explanation: `Soil moisture was recorded as waterlogged on ${latest.observationTime.split('T')[0]}, which may risk root oxygen starvation.`,
          plantId: plant.id,
          plantName: plant.nickname,
          evidence: [
            {
              source: 'observed',
              sourceId: latest.id,
              description: `Substrate recorded as waterlogged at ${latest.observationTime}.`,
            },
          ],
          recommendedAction: 'Check pot drainage holes, ensure saucers are emptied, and allow substrate to dry down before next watering.',
          route: `/app/my-garden?plantId=${plant.id}`,
          confidence: 'high',
        });
      }

      // Stagnant airflow check
      if (latest.airflowQuality === 'stagnant') {
        actions.push({
          id: `act-env-airflow-${plant.id}-${latest.id}`,
          category: 'environment',
          priority: 'medium',
          title: `${plant.nickname}: Stagnant Airflow Observed`,
          explanation: `Sub-optimal air circulation recorded, which may elevate microclimate humidity and fungal pressure.`,
          plantId: plant.id,
          plantName: plant.nickname,
          evidence: [
            {
              source: 'observed',
              sourceId: latest.id,
              description: 'Airflow quality logged as stagnant.',
            },
          ],
          recommendedAction: 'Increase spacing between containers or provide gentle ventilation.',
          route: `/app/my-garden?plantId=${plant.id}`,
          confidence: 'moderate',
        });
      }

      // Temperature bounds check against botanical reference
      if (botanical && botanical.temperatureRange && latest.temperatureCelsius !== undefined && latest.temperatureCelsius !== null) {
        if (latest.temperatureCelsius < botanical.temperatureRange.min) {
          actions.push({
            id: `act-env-templow-${plant.id}-${latest.id}`,
            category: 'environment',
            priority: 'high',
            title: `${plant.nickname}: Temperature Below Preferred Botanical Range`,
            explanation: `Recorded temperature (${latest.temperatureCelsius}°C) is below botanical minimum (${botanical.temperatureRange.min}°C).`,
            plantId: plant.id,
            plantName: plant.nickname,
            evidence: [
              {
                source: 'recorded',
                description: `Recorded ambient: ${latest.temperatureCelsius}°C.`,
              },
              {
                source: 'calculated',
                description: `Botanical preferred range: ${botanical.temperatureRange.min}°C – ${botanical.temperatureRange.max}°C.`,
              },
            ],
            recommendedAction: 'Protect plant from cold drafts or consider moving to a warmer sheltered position.',
            route: `/app/my-garden?plantId=${plant.id}`,
            confidence: 'high',
          });
        } else if (latest.temperatureCelsius > botanical.temperatureRange.max) {
          actions.push({
            id: `act-env-temphigh-${plant.id}-${latest.id}`,
            category: 'environment',
            priority: 'high',
            title: `${plant.nickname}: Temperature Above Preferred Botanical Range`,
            explanation: `Recorded temperature (${latest.temperatureCelsius}°C) exceeds botanical maximum (${botanical.temperatureRange.max}°C).`,
            plantId: plant.id,
            plantName: plant.nickname,
            evidence: [
              {
                source: 'recorded',
                description: `Recorded ambient: ${latest.temperatureCelsius}°C.`,
              },
              {
                source: 'calculated',
                description: `Botanical preferred range: ${botanical.temperatureRange.min}°C – ${botanical.temperatureRange.max}°C.`,
              },
            ],
            recommendedAction: 'Ensure adequate moisture and provide midday shade or ventilation to mitigate heat stress.',
            route: `/app/my-garden?plantId=${plant.id}`,
            confidence: 'high',
          });
        }
      }
    }
  }

  // ============================================================================
  // 4. GROWTH OBSERVATION GAP ACTIONS
  // ============================================================================
  for (const plant of activePlants) {
    const notes = plant.notes || [];
    const recentNotes = notes.filter((n) => new Date(n.date).getTime() >= fourteenDaysAgo.getTime());
    if (recentNotes.length === 0) {
      const lastNote = notes.length > 0 ? notes[notes.length - 1] : null;
      actions.push({
        id: `act-growth-gap-${plant.id}`,
        category: 'growth',
        priority: 'medium',
        title: `${plant.nickname}: Record a Growth Observation`,
        explanation: lastNote
          ? `Last growth observation was recorded on ${lastNote.date} (>14 days ago).`
          : 'No growth notes or stage observations have been recorded since planting.',
        plantId: plant.id,
        plantName: plant.nickname,
        evidence: [
          {
            source: 'recorded',
            description: lastNote ? `Previous note: "${lastNote.text}" on ${lastNote.date}.` : 'Zero growth notes present.',
          },
          {
            source: 'calculated',
            description: 'Over 14 days without an active growth observation.',
          },
        ],
        recommendedAction: 'Inspect current foliage and record a brief growth note or update growth stage.',
        route: `/app/my-garden?plantId=${plant.id}`,
        confidence: 'high',
      });
    }
  }

  // ============================================================================
  // 5. FEEDING ACTIONS
  // ============================================================================
  for (const plant of activePlants) {
    const plantFeeds = feedings.filter((f) => !f.plantId || f.plantId === plant.id);
    for (const f of plantFeeds) {
      if (!f.productName || (!f.npkRatio && !f.dosageUnknown)) {
        actions.push({
          id: `act-feed-incomplete-${f.id}`,
          category: 'feeding',
          priority: 'low',
          title: `${plant.nickname}: Review Incomplete Feeding Record`,
          explanation: `Feeding logged on ${f.feedingDate} is missing fertilizer product name or NPK composition details.`,
          plantId: plant.id,
          plantName: plant.nickname,
          evidence: [
            {
              source: 'recorded',
              sourceId: f.id,
              description: `Feeding record on ${f.feedingDate} lacks complete formulation data.`,
            },
          ],
          recommendedAction: 'Update the feeding entry with the product name or mark dosage as unknown. Follow manufacturer label instructions.',
          route: `/app/my-garden?plantId=${plant.id}`,
          confidence: 'high',
        });
      }
    }
  }

  // ============================================================================
  // 6. PRODUCTION & HARVEST ACTIONS
  // ============================================================================
  for (const plant of activePlants) {
    if (plant.currentStage === 'Mature') {
      actions.push({
        id: `act-prod-mature-${plant.id}`,
        category: 'production',
        priority: 'medium',
        title: `${plant.nickname}: Visual Harvest Readiness Check`,
        explanation: `Plant has reached the "Mature" growth stage. Periodic visual checks identify optimal harvest timing.`,
        plantId: plant.id,
        plantName: plant.nickname,
        evidence: [
          {
            source: 'recorded',
            description: `Current growth stage recorded as Mature.`,
          },
        ],
        recommendedAction: 'Inspect fruit or foliage for cultivar-appropriate maturity and log harvest when gathered.',
        route: `/app/my-garden?plantId=${plant.id}`,
        confidence: 'moderate',
      });
    }
  }

  for (const cycle of cycles) {
    if (cycle.status === 'active' && cycle.expectedEndDate) {
      const expDate = new Date(cycle.expectedEndDate);
      const daysUntilHarvest = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilHarvest <= 7 && daysUntilHarvest >= -7) {
        actions.push({
          id: `act-prod-cycle-${cycle.id}`,
          category: 'production',
          priority: 'medium',
          title: `Crop Cycle "${cycle.cycleName}": Harvest Window Approaching`,
          explanation: `Target harvest date is ${cycle.expectedEndDate} (${daysUntilHarvest >= 0 ? `${daysUntilHarvest} days remaining` : `${Math.abs(daysUntilHarvest)} days past target`}).`,
          evidence: [
            {
              source: 'recorded',
              sourceId: cycle.id,
              description: `Cycle expected harvest date set to ${cycle.expectedEndDate}.`,
            },
            {
              source: 'calculated',
              description: `Calculated delta: ${daysUntilHarvest} days from current date.`,
            },
          ],
          recommendedAction: 'Inspect crop batch for readiness and record harvest events as picking occurs.',
          route: '/app/grow-intelligence',
          confidence: 'moderate',
        });
      }
    }
  }

  // ============================================================================
  // 7. PROPAGATION ACTIONS
  // ============================================================================
  for (const prop of propagations) {
    if (prop.status === 'in_progress' || prop.status === 'pending_outcome') {
      const startDate = new Date(prop.startedDate);
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceStart >= 7) {
        actions.push({
          id: `act-prop-check-${prop.id}`,
          category: 'propagation',
          priority: 'medium',
          title: `Propagation Check: ${prop.propagationMethod.replace('_', ' ')} (${daysSinceStart} days)`,
          explanation: `Propagation started on ${prop.startedDate} has been active for ${daysSinceStart} days without outcome update.`,
          evidence: [
            {
              source: 'recorded',
              sourceId: prop.id,
              description: `Propagation method "${prop.propagationMethod}" started on ${prop.startedDate}.`,
            },
            {
              source: 'calculated',
              description: `${daysSinceStart} days elapsed since initiation.`,
            },
          ],
          recommendedAction: 'Check cutting for root emergence, callusing, or signs of rot, and log progress.',
          route: '/app/grow-intelligence',
          confidence: 'high',
        });
      }
    }
  }

  // ============================================================================
  // 8. SPACE & STRUCTURAL SAFETY ACTIONS
  // ============================================================================
  if (spaceMetrics) {
    if (spaceMetrics.occupancyRatePercent >= 85) {
      actions.push({
        id: `act-space-utilization`,
        category: 'space',
        priority: 'low',
        title: 'Space Advisory: High Capacity Utilization',
        explanation: `Garden space utilization is currently at ${spaceMetrics.occupancyRatePercent}% (${spaceMetrics.activePlantsOccupied}/${spaceMetrics.totalSpaceCapacityUnits} slots).`,
        evidence: [
          {
            source: 'calculated',
            description: `Occupancy rate ${spaceMetrics.occupancyRatePercent}%.`,
          },
        ],
        recommendedAction: 'Plan succession crop spacing carefully. Always verify structural load capacity before increasing container load.',
        route: '/app/planner',
        confidence: 'high',
      });
    }
  }

  // ============================================================================
  // 9. DATA QUALITY ACTIONS
  // ============================================================================
  if (plants.length > 0) {
    const unrecordedDates = plants.filter((p) => !p.plantedDate);
    if (unrecordedDates.length > 0) {
      actions.push({
        id: `act-data-planted-dates`,
        category: 'data_quality',
        priority: 'informational',
        title: 'Complete Plant Record Dates',
        explanation: `${unrecordedDates.length} plant(s) have unrecorded planting dates, which limits age tracking accuracy.`,
        evidence: [
          {
            source: 'recorded',
            description: `Plants lacking plantedDate: ${unrecordedDates.map((p) => p.nickname).join(', ')}.`,
          },
        ],
        recommendedAction: 'Add estimated or recorded planting dates in My Garden.',
        route: '/app/my-garden',
        confidence: 'high',
      });
    }
  }

  // Deduplicate actions by ID
  const uniqueMap = new Map<string, GrowAction>();
  for (const act of actions) {
    if (!uniqueMap.has(act.id)) {
      uniqueMap.set(act.id, act);
    }
  }

  return Array.from(uniqueMap.values());
}

