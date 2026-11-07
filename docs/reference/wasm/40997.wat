  (func (;40997;) (type 1) (param i32 i32)
    (local i32)
    i32.const 4365113
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4365113
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=60
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    local.get 1
    i32.const 0
    i32.const 0
    call 48872
    i32.eqz
    if  ;; label = @1
      local.get 0
      local.get 0
      i32.load offset=60
      local.get 0
      call 41004
      local.get 0
      i32.const 0
      i32.store offset=60
    end
    local.get 0
    local.get 0
    call 41005
    i32.const 4365115
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4365115
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=64
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    local.get 1
    i32.const 0
    i32.const 0
    call 48872
    i32.eqz
    if  ;; label = @1
      local.get 0
      local.get 0
      i32.load offset=64
      local.get 0
      call 41004
      local.get 0
      i32.const 0
      i32.store offset=64
    end)
