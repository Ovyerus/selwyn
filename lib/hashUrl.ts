import hash from '@emotion/hash';
import {parse} from 'url';

export default (url: string) => hash(parse(url).href!);
