function fustyFlowFactory(opts) {
	var flow = new Flow(opts);
	if (flow.support || typeof FustyFlow == 'undefined') {
		return flow;
	}
	return new FustyFlow(opts);
};
