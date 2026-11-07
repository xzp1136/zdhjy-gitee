  (func (;44363;) (type 2) (param i32 i32 i32)
    (local i32)
    i32.const 4367385
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4367385
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=44
    local.set 2
    i32.const 3360788
    i32.load
    local.tee 3
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 3
      call 60460
    end
    local.get 2
    i32.const 0
    i32.const 0
    call 48812
    if  ;; label = @1
      local.get 0
      i32.load offset=44
      local.get 1
      i32.const 0
      call 48707
    end)
