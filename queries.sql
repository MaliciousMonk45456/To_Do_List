create table lists(
	_id SERIAL,
	title varchar(50) primary key
);

create table items(
	_id SERIAL Primary key,
	title varchar(50) not null,
	listname varchar(50) references lists(title)
);

select * from lists

select * from items