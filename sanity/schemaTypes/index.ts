import type {SchemaTypeDefinition} from 'sanity';

// Objects
import {seoType} from './objects/seo';

// Documents
import {developerType} from './documents/developer';
import {areaGuideType} from './documents/areaGuide';
import {projectType} from './documents/project';
import {serviceType} from './documents/service';
import {pressArticleType} from './documents/pressArticle';
import {founderTimelineType} from './documents/founderTimeline';
import {legalPageType} from './documents/legalPage';
import {trackRecordItemType} from './documents/trackRecordItem';
import {videoItemType} from './documents/videoItem';
import {clientStoryType} from './documents/clientStory';
import {testimonialType} from './documents/testimonial';

// Singletons
import {homePageType} from './singletons/homePage';
import {founderPageType} from './singletons/founderPage';
import {siteSettingsType} from './singletons/siteSettings';

/**
 * NOTE: AdminUser and AuditLog are deliberately NOT Sanity types. They
 * live in Upstash Redis + Cloudflare R2 (see plan: "Admin data store —
 * NOT Sanity"). Sanity's default dataset is publicly readable; storing
 * credentials there would be a serious exposure.
 */
export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    // Shared objects
    seoType,
    // Documents
    developerType,
    areaGuideType,
    projectType,
    serviceType,
    pressArticleType,
    founderTimelineType,
    legalPageType,
    trackRecordItemType,
    videoItemType,
    clientStoryType,
    testimonialType,
    // Singletons
    homePageType,
    founderPageType,
    siteSettingsType
  ]
};

export const singletonTypes = ['homePage', 'founderPage', 'siteSettings'];
