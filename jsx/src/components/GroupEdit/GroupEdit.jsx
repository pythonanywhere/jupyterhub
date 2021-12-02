import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import GroupSelect from "../GroupSelect/GroupSelect";
import DynamicTable from "../DynamicTable/DynamicTable";

function hasDuplicates(array) {
  var valuesSoFar = Object.create(null);
  for (var i = 0; i < array.length; ++i) {
    var value = array[i];
    if (value in valuesSoFar) {
      return true;
    }
    valuesSoFar[value] = true;
  }
  return false;
}

const GroupEdit = (props) => {
  var [selected, setSelected] = useState([]),
    [changed, setChanged] = useState(false),
    limit = useSelector((state) => state.limit);

  var dispatch = useDispatch();

  const dispatchPageUpdate = (data, page) => {
    dispatch({
      type: "GROUPS_PAGE",
      value: {
        data: data,
        page: page,
      },
    });
  };

  var {
    addToGroup,
    updateProp,
    removeFromGroup,
    deleteGroup,
    updateGroups,
    validateUser,
    history,
    location,
  } = props;

  if (!location.state) {
    history.push("/groups");
    return <></>;
  }

  var { group_data } = location.state;
  var [propobject, setProp] = useState(group_data.properties);
  var [propkeys, setPropKeys] = useState([]);
  var [propvalues, setPropValues] = useState([]);

  if (!group_data) return <div></div>;

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">
          <h3>Editing Group {group_data.name}</h3>
          <br></br>
          <div className="alert alert-info">Manage group members</div>
        </div>
      </div>
      <GroupSelect
        users={group_data.users}
        validateUser={validateUser}
        onChange={(selection) => {
          setSelected(selection);
          setChanged(true);
        }}
      />
      <div className="row">
        <div className="col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">
          <div className="alert alert-info">Manage group properties</div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">
          <DynamicTable
            current_propobject={group_data.properties}
            setProp={setProp}
            setPropKeys={setPropKeys}
            setPropValues={setPropValues}
            setChanged={setChanged}
            //Add keys
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">
          <button id="return" className="btn btn-light">
            <Link to="/groups">Back</Link>
          </button>
          <span> </span>
          <button
            id="submit"
            className="btn btn-primary"
            onClick={() => {
              // check for changes
              //if (!changed) {
              //  history.push("/groups");
              //  return;
              //}

              let new_users = selected.filter(
                (e) => !group_data.users.includes(e)
              );
              let removed_users = group_data.users.filter(
                (e) => !selected.includes(e)
              );
              let promiseQueue = [];
              if (new_users.length > 0)
                promiseQueue.push(addToGroup(new_users, group_data.name));
              if (removed_users.length > 0)
                promiseQueue.push(
                  removeFromGroup(removed_users, group_data.name)
                );
              if (hasDuplicates(propkeys) == true) {
                error.textContent = "Duplicate key found!";
                error.style.color = "red";
              } else {
                //error.textContent = "";
                propkeys.forEach((key, i) => (propobject[key] = propvalues[i]));
              }
              if (
                propobject != group_data.properties &&
                hasDuplicates(propkeys) == false
              ) {
                promiseQueue.push(updateProp(propobject, group_data.name));
              }
              Promise.all(promiseQueue)
                .then(() => {
                  updateGroups(0, limit).then((data) =>
                    dispatchPageUpdate(data, 0)
                  );
                })
                .catch((err) => console.log(err));
            }}
          >
            Apply
          </button>
          <div>
            <span id="error"></span>
          </div>
          <button
            id="delete-group"
            className="btn btn-danger"
            style={{ float: "right" }}
            onClick={() => {
              var groupName = group_data.name;
              deleteGroup(groupName)
                .then(() => {
                  updateGroups(0, limit)
                    .then((data) => dispatchPageUpdate(data, 0))
                    .then(() => history.push("/groups"));
                })
                .catch((err) => console.log(err));
            }}
          >
            Delete Group
          </button>
          <br></br>
          <br></br>
        </div>
      </div>
    </div>
  );
};

GroupEdit.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      group_data: PropTypes.object,
      callback: PropTypes.func,
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  addToGroup: PropTypes.func,
  removeFromGroup: PropTypes.func,
  deleteGroup: PropTypes.func,
  updateGroups: PropTypes.func,
  validateUser: PropTypes.func,
};

export default GroupEdit;
