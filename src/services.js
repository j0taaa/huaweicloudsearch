const HUAWEI_CLOUD_SERVICES = [
  {
    name: "Elastic Cloud Server",
    shortName: "ECS",
    keywords: ["virtual machine", "compute", "vm"],
    iconUrl: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Compute/ECS.png",
    url: "https://sa-brazil-1-console.huaweicloud.com/ecm/?locale=en-us&agencyId=f04e1d3b40c34c13aa9f14118f7217e5&region=sa-brazil-1#/ecs/manager/vmList"
  },
  {
    name: "Virtual Private Cloud",
    shortName: "VPC",
    keywords: ["network", "subnet", "security group"],
    iconUrl: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Networking/VPC.png",
    url: "https://console.huaweicloud.com/vpc/?locale=en-us"
  },
  {
    name: "Object Storage Service",
    shortName: "OBS",
    keywords: ["bucket", "storage", "files"],
    iconUrl: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Storage/OBS.png",
    url: "https://console.huaweicloud.com/obs/?locale=en-us"
  },
  {
    name: "Relational Database Service",
    shortName: "RDS",
    keywords: ["mysql", "postgresql", "database"],
    iconUrl: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Databases/RDSforMySQL.png",
    url: "https://console.huaweicloud.com/rds/?locale=en-us"
  },
  {
    name: "Cloud Container Engine",
    shortName: "CCE",
    keywords: ["kubernetes", "containers", "cluster"],
    iconUrl: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Containers/CCE.png",
    url: "https://console.huaweicloud.com/cce/?locale=en-us"
  },
  {
    name: "Simple Message Notification",
    shortName: "SMN",
    keywords: ["notification", "pubsub", "topics"],
    iconUrl: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/ManagementGovernance/SMN.png",
    url: "https://console.huaweicloud.com/smn/?locale=en-us"
  },
  {
    name: "Identity and Access Management",
    shortName: "IAM",
    keywords: ["permissions", "users", "roles"],
    iconUrl: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/ManagementGovernance/IAM.png",
    url: "https://console.huaweicloud.com/iam/?locale=en-us"
  },
  {
    name: "Cloud Backup and Recovery",
    shortName: "CBR",
    keywords: ["backup", "recovery", "snapshot"],
    iconUrl: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Storage/CBR.png",
    url: "https://console.huaweicloud.com/cbr/?locale=en-us"
  },
  {
    name: "Cloud Eye",
    shortName: "CES",
    keywords: ["monitoring", "metrics", "alarms"],
    iconUrl: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/ManagementGovernance/CES.png",
    url: "https://console.huaweicloud.com/ces/?locale=en-us"
  },
  {
    name: "Distributed Cache Service",
    shortName: "DCS",
    keywords: ["redis", "cache", "memory"],
    iconUrl: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Middleware/Redis.png",
    url: "https://console.huaweicloud.com/dcs/?locale=en-us"
  }
];

if (typeof window !== "undefined") {
  window.HUAWEI_CLOUD_SERVICES = HUAWEI_CLOUD_SERVICES;
}
