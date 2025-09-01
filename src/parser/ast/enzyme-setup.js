/**
 * Set up enzume for rendering tests.
 * See `AST.renderedText`
 */
import { configure, mount } from "enzyme"
import Adapter from "@cfaester/enzyme-adapter-react-18"

configure({ adapter: new Adapter() })

export { mount }
