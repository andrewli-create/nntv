import CMS from 'decap-cms-app'
import uploadcare from 'decap-cms-media-library-uploadcare'
import cloudinary from 'decap-cms-media-library-cloudinary'

import AboutPagePreview from './preview-templates/AboutPagePreview'
import BlogPostPreview from './preview-templates/BlogPostPreview'
import ProductPagePreview from './preview-templates/ProductPagePreview'
import IndexPagePreview from './preview-templates/IndexPagePreview'
import NavBarPreview from './preview-templates/NavBarPreview'
import FooterPreview from './preview-templates/FooterPreview'
import OurVisionPagePreview from './preview-templates/OurVisionPagePreview'
import CoursePagePreview from './preview-templates/CoursePagePreview'
import ModulePageTemplate from './preview-templates/ModulePagePreview'

import UnderConstructionPagePreview from './preview-templates/UnderConstructionPagePreview'
import { ColorControl, ColorPreview } from "netlify-cms-widget-colorpicker";
import $ from 'jquery';
import './cms-utils'
// import style from "../style/cms.css"
import { InlineSelectControl, InlineSelectPreview } from 'netlify-cms-widget-inline-select';

CMS.registerWidget('inline-select', InlineSelectControl, InlineSelectPreview);
CMS.registerWidget('color', ColorControl, ColorPreview);
// CMS.registerPreviewStyle("../../static/admin/preview-pane-style.css");

CMS.registerMediaLibrary(uploadcare)
CMS.registerMediaLibrary(cloudinary)

CMS.registerPreviewTemplate('index', IndexPagePreview)
CMS.registerPreviewTemplate('about', AboutPagePreview)
CMS.registerPreviewTemplate('products', ProductPagePreview)
CMS.registerPreviewTemplate('our-vision', OurVisionPagePreview)
CMS.registerPreviewTemplate('course', CoursePagePreview)
CMS.registerPreviewTemplate('module', ModulePageTemplate)
CMS.registerPreviewTemplate('blog', BlogPostPreview)
CMS.registerPreviewTemplate('nav-bar', NavBarPreview)
CMS.registerPreviewTemplate('footer', FooterPreview)
CMS.registerPreviewTemplate('under-construction', UnderConstructionPagePreview)
