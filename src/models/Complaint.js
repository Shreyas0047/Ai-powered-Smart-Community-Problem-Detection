const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    reporter: { type: String, required: true },
    reporterUserId: { type: String, default: "" },
    reporterUsername: { type: String, required: true },
    type: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, required: true },
    source: { type: String, required: true },
    confidence: { type: Number, required: true },
    location: { type: String, required: true },
    cityId: { type: String, required: true, default: "bengaluru", lowercase: true, trim: true, index: true },
    cityName: { type: String, required: true, default: "Bengaluru", trim: true },
    assignedAuthority: { type: String, default: "Gram Panchayat" },
    routing: {
      cityId: String,
      cityName: String,
      routingRegistryVersion: String,
      authority: String,
      department: String,
      unit: String,
      unitId: String,
      ward: String,
      wardCode: String,
      wardZone: String,
      wardMatchQuality: String,
      wardRequiresConfirmation: Boolean,
      escalationLevel: String,
      escalationDestination: String,
      deliveryStatus: String,
      workloadScore: Number,
      activeCaseLoad: Number,
      maxActiveCases: Number,
      contactEmail: String,
      portalUrl: String,
      handoff: {
        mode: String,
        supportsDirectApi: Boolean,
        portalUrl: String,
        verifiedAt: Date
      },
      routingReason: String,
      alternatives: [
        {
          unitId: String,
          department: String,
          unit: String,
          authority: String,
          score: Number,
          activeCaseLoad: Number,
          workloadScore: Number
        }
      ],
      assignedAt: Date
    },
    broadcast: {
      triggered: { type: Boolean, default: false },
      broadcastId: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyBroadcast", default: null },
      status: { type: String, default: "" },
      channels: [{ type: String }],
      recipientCount: { type: Number, default: 0 },
      message: { type: String, default: "" },
      sentAt: { type: Date, default: null }
    },
    incidentCommand: {
      triggered: { type: Boolean, default: false },
      incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "IncidentCommand", default: null },
      incidentCode: { type: String, default: "" },
      status: { type: String, default: "" },
      severity: { type: String, default: "" },
      assignedUnit: { type: String, default: "" },
      slaDueAt: { type: Date, default: null },
      checklistTotal: { type: Number, default: 0 },
      checklistDone: { type: Number, default: 0 },
      riskScore: { type: Number, default: 0 },
      summary: { type: String, default: "" }
    },
    incidentCluster: {
      clustered: { type: Boolean, default: false },
      clusterId: { type: mongoose.Schema.Types.ObjectId, ref: "IncidentCluster", default: null },
      clusterCode: { type: String, default: "" },
      title: { type: String, default: "" },
      confidence: { type: Number, default: 0 },
      matchReason: { type: String, default: "" },
      mergedCount: { type: Number, default: 1 },
      matchedComplaintIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Complaint" }]
    },
    mapLocation: {
      lat: Number,
      lng: Number
    },
    areaIntelligence: {
      provider: { type: String, default: "" },
      likelyArea: { type: String, default: "" },
      matchedAreas: [{ type: String }],
      landmarkHints: [{ type: String }],
      wardHints: [{ type: String }],
      normalizedLocation: { type: String, default: "" },
      matchingTerms: [{ type: String }],
      confidence: { type: Number, default: 0 },
      mapLocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
      }
    },
    weather: {
      status: { type: String, default: "unavailable" },
      provider: { type: String, default: "weatherstack" },
      reason: { type: String, default: "" },
      observedAt: { type: String, default: "" },
      locationName: { type: String, default: "" },
      temperatureC: { type: Number, default: null },
      condition: { type: String, default: "" },
      precipitationMm: { type: Number, default: null },
      humidity: { type: Number, default: null },
      windKph: { type: Number, default: null },
      note: { type: String, default: "" },
      cached: { type: Boolean, default: false },
      quota: mongoose.Schema.Types.Mixed
    },
    civicEvidence: {
      status: { type: String, default: "unavailable" },
      provider: { type: String, default: "zenserp" },
      reason: { type: String, default: "" },
      quota: mongoose.Schema.Types.Mixed,
      officialSources: [
        {
          title: String,
          url: String,
          snippet: String,
          sourceType: String,
          query: String,
          domain: String,
          official: Boolean
        }
      ],
      publicContext: [
        {
          title: String,
          url: String,
          snippet: String,
          sourceType: String,
          query: String,
          domain: String
        }
      ]
    },
    description: { type: String, required: true },
    alerts: [{ type: String }],
    followUp: {
      status: { type: String, default: "scheduled", enum: ["scheduled", "due", "overdue", "closed"] },
      nextDueAt: { type: Date, default: null },
      lastGeneratedAt: { type: Date, default: null },
      count: { type: Number, default: 0 },
      reason: { type: String, default: "" },
      escalationNote: { type: String, default: "" }
    },
    verification: {
      summary: {
        stillThere: { type: Number, default: 0 },
        resolved: { type: Number, default: 0 },
        gotWorse: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        citizenStatus: { type: String, default: "unverified" },
        lastVoteAt: { type: Date, default: null }
      },
      votes: [
        {
          userId: { type: String, default: "" },
          username: { type: String, default: "" },
          vote: { type: String, enum: ["still_there", "resolved", "got_worse"] },
          note: { type: String, default: "" },
          createdAt: { type: Date, default: Date.now }
        }
      ]
    },
    resolution: {
      phase: {
        type: String,
        enum: ["not_requested", "awaiting_citizen_verification", "citizen_confirmed", "needs_rework", "needs_admin_review"],
        default: "not_requested"
      },
      authorityUpdate: {
        markedBy: { type: String, default: "" },
        markedAt: { type: Date, default: null },
        note: { type: String, default: "" }
      },
      citizenEvidence: [
        {
          userId: { type: String, default: "" },
          username: { type: String, default: "" },
          vote: { type: String, enum: ["still_there", "resolved", "got_worse"] },
          note: { type: String, default: "" },
          imageProvided: { type: Boolean, default: false },
          imageFingerprint: { type: String, default: "" },
          submittedAt: { type: Date, default: Date.now }
        }
      ],
      aiAssessment: {
        outcome: { type: String, default: "" },
        confidence: { type: Number, default: 0 },
        reason: { type: String, default: "" },
        visualComparison: { type: String, default: "" },
        engine: { type: String, default: "" },
        assessedAt: { type: Date, default: null },
        disclaimer: { type: String, default: "" }
      }
    },
    communityProof: {
      summary: {
        total: { type: Number, default: 0 },
        corroborates: { type: Number, default: 0 },
        cleared: { type: Number, default: 0 },
        worsening: { type: Number, default: 0 },
        stillPresent: { type: Number, default: 0 },
        resolved: { type: Number, default: 0 },
        duplicate: { type: Number, default: 0 },
        trustedTotal: { type: Number, default: 0 },
        suspiciousCount: { type: Number, default: 0 },
        latestStatus: { type: String, default: "unverified" },
        conflictScore: { type: Number, default: 0 },
        confidenceAdjustment: { type: Number, default: 0 },
        effectiveConfidence: { type: Number, default: 0 },
        urgencyAdjustment: { type: Number, default: 0 },
        effectivePriority: { type: String, default: "" },
        communityWide: { type: Boolean, default: false },
        lastSignalAt: { type: Date, default: null },
        lastVerifiedAt: { type: Date, default: null }
      },
      signals: [
        {
          actorHash: { type: String, default: "", select: false },
          userId: { type: String, default: "" },
          signal: { type: String, enum: ["corroborates", "cleared", "still_present", "resolved", "worsening", "duplicate"] },
          note: { type: String, default: "" },
          duplicateComplaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", default: null },
          areaKeyHash: { type: String, default: "", select: false },
          eligibility: { type: String, default: "saved_area" },
          suspicious: { type: Boolean, default: false },
          revisionCount: { type: Number, default: 0 },
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now }
        }
      ]
    },
    humanReview: {
      status: {
        type: String,
        enum: ["unreviewed", "confirmed", "corrected", "insufficient_evidence"],
        default: "unreviewed"
      },
      original: {
        categoryId: { type: String, default: "" },
        type: { type: String, default: "" },
        priority: { type: String, default: "" },
        department: { type: String, default: "" },
        authority: { type: String, default: "" }
      },
      decision: {
        categoryId: { type: String, default: "" },
        type: { type: String, default: "" },
        priority: { type: String, default: "" },
        department: { type: String, default: "" },
        authority: { type: String, default: "" }
      },
      changedFields: [{ type: String }],
      reason: { type: String, default: "" },
      reviewerRole: { type: String, default: "" },
      reviewedAt: { type: Date, default: null }
    },
    decisionAudit: {
      headEventId: { type: String, default: "" },
      headHash: { type: String, default: "" },
      eventCount: { type: Number, default: 0 },
      integrityStatus: { type: String, enum: ["not_recorded", "verified", "failed"], default: "not_recorded" },
      lastRecordedAt: { type: Date, default: null }
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: String, default: "system" },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: "" }
      }
    ],
    ai: {
      nlpCategory: String,
      cvDetection: String,
      cvReason: String,
      mlPriorityScore: Number,
      recommendedTeam: String,
      explanation: String,
      confidenceLabel: String,
      reviewRequired: { type: Boolean, default: false },
      geocodingSource: String,
      provider: String,
      engine: String,
      model: String,
      fallbackUsed: { type: Boolean, default: false },
      categoryId: String,
      visionEngine: String,
      visionProvider: String,
      visionFallbackUsed: { type: Boolean, default: false },
      visionCandidates: [
        {
          label: String,
          categoryId: String,
          confidence: Number,
          source: String
        }
      ],
      confidenceBreakdown: mongoose.Schema.Types.Mixed,
      visualObservations: mongoose.Schema.Types.Mixed,
      evaluationVersion: String,
      threatAssessment: mongoose.Schema.Types.Mixed,
      threatLevel: { type: String, default: "" },
      riskScore: { type: Number, default: 0 },
      imageFingerprint: { type: String, default: "" }
    }
  },
  {
    timestamps: true
  }
);

complaintSchema.index({ cityId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
