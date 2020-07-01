/**
 * Set up enzume for rendering tests.
 * See `AST.renderedText`
 */
import { configure, mount } from "enzyme"
import Adapter from "enzyme-adapter-react-16"
configure({ adapter: new Adapter() })

export { mount }
