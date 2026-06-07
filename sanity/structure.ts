import type {DocumentActionComponent, DocumentActionsContext} from 'sanity';
import type {StructureResolver} from 'sanity/structure';
import {singletonTypes} from './schemaTypes';

/**
 * Desk structure — singletons (HomePage, FounderPage, SiteSettings) get
 * dedicated entries so editors don't see them in a generic document list.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(S.editor().id('siteSettings').schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('Home page')
        .id('homePage')
        .child(S.editor().id('homePage').schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('Founder page')
        .id('founderPage')
        .child(S.editor().id('founderPage').schemaType('founderPage').documentId('founderPage')),
      S.divider(),
      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('areaGuide').title('Area guides'),
      S.documentTypeListItem('developer').title('Developers'),
      S.documentTypeListItem('service').title('Services'),
      S.documentTypeListItem('pressArticle').title('Press articles'),
      S.documentTypeListItem('founderTimeline').title('Founder timeline'),
      S.documentTypeListItem('legalPage').title('Legal pages'),
      S.divider(),
      S.listItem().title('— v1.1 deferred —').child(S.list().title('Deferred').items([
        S.documentTypeListItem('trackRecordItem').title('Track record items'),
        S.documentTypeListItem('videoItem').title('Videos'),
        S.documentTypeListItem('clientStory').title('Client stories')
      ]))
    ]);

/**
 * Block delete on singleton document types so editors can't accidentally
 * wipe them. Sanity will still allow edits.
 */
export const singletonActionFilter = (
  actions: DocumentActionComponent[],
  context: DocumentActionsContext
): DocumentActionComponent[] =>
  singletonTypes.includes(context.schemaType)
    ? actions.filter((a) => !a.action || !['delete', 'duplicate'].includes(a.action))
    : actions;
