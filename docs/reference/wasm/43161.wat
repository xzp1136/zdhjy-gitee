  (func (;43161;) (type 1) (param i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 1
    global.set 0
    i32.const 4366525
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3387788
      call 2180
      i32.const 3387776
      call 2180
      i32.const 3351356
      call 2180
      i32.const 4366525
      i32.const 1
      i32.store8
    end
    i32.const 3351356
    i32.load
    call 1900
    local.tee 3
    i32.const 3387776
    i32.load
    call 35169
    i32.const 3387788
    i32.load
    local.set 2
    local.get 1
    i32.const 9
    i32.store offset=8
    local.get 3
    local.get 1
    i32.const 8
    i32.add
    local.get 2
    call 50463
    i32.const 3387788
    i32.load
    local.set 2
    local.get 1
    i32.const 9
    i32.store offset=12
    local.get 3
    local.get 1
    i32.const 12
    i32.add
    local.get 2
    call 50463
    local.get 1
    local.get 3
    local.get 1
    call 43163
    local.get 1
    local.get 1
    call 43164
    local.get 0
    i32.const 1
    i32.const 0
    local.get 0
    i32.load
    local.tee 2
    i32.load offset=236
    local.get 2
    i32.load offset=232
    call_indirect (type 6)
    local.get 1
    local.get 3
    i32.const 1
    local.get 1
    call 43165
    local.get 1
    i32.const 16
    i32.add
    global.set 0)
