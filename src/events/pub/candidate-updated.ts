import { CandidateUpdatedEvent } from 'common/types/events/candidate'
import { Publisher } from 'common/services/nats'
import { Subjects } from 'common/types/events'

class CandidateUpdatedPub extends Publisher<CandidateUpdatedEvent> {
	private static _instance: CandidateUpdatedPub = new CandidateUpdatedPub()

	readonly subject = Subjects.CandidateUpdated

	static get instance() {
		return this._instance
	}
}

const instance = CandidateUpdatedPub.instance
export { instance as candidate_updated_pub }
